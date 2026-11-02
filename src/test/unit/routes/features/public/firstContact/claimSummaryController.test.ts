import {NextFunction, Response} from 'express';
import {AppRequest, AppSession} from 'common/models/AppRequest';
import {Claim} from 'models/claim';
import {YesNo} from 'form/models/yesNo';
import {getClaimById} from 'modules/utilityService';
import {getInterestDetails} from 'common/utils/interestUtils';
import {getFixedCost, getTotalAmountWithInterestAndFeesAndFixedCost} from 'modules/claimDetailsService';
import {getClaimTimeline} from 'services/features/common/claimTimelineService';
import {encryptSessionValue} from 'services/firstcontact/sessionValueCrypto';
import firstContactClaimSummaryController from 'routes/features/public/firstContact/claimSummaryController';
import {FIRST_CONTACT_ACCESS_DENIED_URL, FIRST_CONTACT_CLAIM_SUMMARY_URL} from 'routes/urls';
import {createMockResponse, getRouteHandler} from '../../../../../utils/getRouteHandler';

jest.mock('modules/utilityService', () => ({
  getClaimById: jest.fn(),
}));
jest.mock('common/utils/interestUtils', () => ({
  getInterestDetails: jest.fn().mockResolvedValue({interest: 0}),
}));
jest.mock('modules/claimDetailsService', () => ({
  getFixedCost: jest.fn().mockResolvedValue(0),
  getTotalAmountWithInterestAndFeesAndFixedCost: jest.fn().mockResolvedValue(100),
}));
jest.mock('services/features/common/claimTimelineService', () => ({
  getClaimTimeline: jest.fn().mockReturnValue([]),
}));

const mockGetClaimById = getClaimById as jest.Mock;
const accessCode = 'H4WYG26R6PA9';
const claimId = '1645882162449404';

const invoke = async (session: AppSession) => {
  const res = createMockResponse();
  const next = jest.fn() as NextFunction;
  const req = {session, query: {}, cookies: {}} as AppRequest;
  await getRouteHandler(firstContactClaimSummaryController, 'get', FIRST_CONTACT_CLAIM_SUMMARY_URL)(
    req,
    res as unknown as Response,
    next,
  );
  return {res, next};
};

const claimWithAccessCode = (): Claim => {
  const claim = new Claim();
  claim.id = claimId;
  claim.respondent1PinToPostLRspec = {accessCode} as Claim['respondent1PinToPostLRspec'];
  return claim;
};

describe('First contact - claim summary controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetClaimById.mockResolvedValue(claimWithAccessCode());
  });

  it('renders the claim summary when the pin decrypts to yes', async () => {
    const {res, next} = await invoke({
      firstContact: {claimId, pin: encryptSessionValue(YesNo.YES, accessCode)},
    } as AppSession);

    expect(res.render).toHaveBeenCalledWith('features/public/firstContact/claim-summary', expect.objectContaining({
      claimId,
      totalAmount: 100,
      fixedCost: 0,
      timelineRows: [],
    }));
    expect(getInterestDetails).toHaveBeenCalled();
    expect(getTotalAmountWithInterestAndFeesAndFixedCost).toHaveBeenCalled();
    expect(getFixedCost).toHaveBeenCalled();
    expect(getClaimTimeline).toHaveBeenCalled();
    expect(next).not.toHaveBeenCalled();
  });

  it('redirects to access denied when the claim id or pin is missing', async () => {
    const missingPin = await invoke({firstContact: {claimId}} as AppSession);
    const missingClaimId = await invoke({
      firstContact: {pin: encryptSessionValue(YesNo.YES, accessCode)},
    } as AppSession);
    const emptyContact = await invoke({firstContact: {}} as AppSession);
    const missingContact = await invoke({} as AppSession);

    for (const result of [missingPin, missingClaimId, emptyContact, missingContact]) {
      expect(result.res.redirect).toHaveBeenCalledWith(FIRST_CONTACT_ACCESS_DENIED_URL);
      expect(result.res.render).not.toHaveBeenCalled();
    }
  });

  it('redirects to access denied when the pin does not decrypt to yes', async () => {
    const {res} = await invoke({
      firstContact: {claimId, pin: encryptSessionValue(YesNo.NO, accessCode)},
    } as AppSession);

    expect(res.redirect).toHaveBeenCalledWith(FIRST_CONTACT_ACCESS_DENIED_URL);
  });

  it('redirects to access denied when the claim has no access code', async () => {
    mockGetClaimById.mockResolvedValue(new Claim());

    const {res} = await invoke({
      firstContact: {claimId, pin: encryptSessionValue(YesNo.YES, accessCode)},
    } as AppSession);

    expect(res.redirect).toHaveBeenCalledWith(FIRST_CONTACT_ACCESS_DENIED_URL);
  });

  it('calls next with the error when loading the claim fails', async () => {
    const error = new Error('redis failure');
    mockGetClaimById.mockRejectedValue(error);

    const {next, res} = await invoke({
      firstContact: {claimId, pin: encryptSessionValue(YesNo.YES, accessCode)},
    } as AppSession);

    expect(next).toHaveBeenCalledWith(error);
    expect(res.render).not.toHaveBeenCalled();
  });
});
