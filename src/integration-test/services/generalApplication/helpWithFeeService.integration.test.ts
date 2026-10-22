process.env.NODE_ENV = 'test';
import '../../setup/testSetup';
jest.unmock('services/features/generalApplication/fee/helpWithFeeService');
jest.mock('modules/draft-store/draftStoreService', () => ({
  generateRedisKey: jest.fn(() => 'redis-claim-key'),
  saveDraftClaim: jest.fn().mockResolvedValue(undefined),
}));
jest.mock('modules/draft-store/gaHwFeesDraftStore', () => ({
  getDraftGAHWFDetails: jest.fn(),
  saveDraftGAHWFDetails: jest.fn().mockResolvedValue(undefined),
}));
jest.mock('services/features/generalApplication/applicationFee/generalApplicationFeePaymentService', () => ({
  getGaFeePaymentRedirectInformation: jest.fn(),
  getGaFeePaymentStatus: jest.fn(),
}));
jest.mock('modules/utilityService', () => ({
  ...jest.requireActual('modules/utilityService'),
  getClaimById: jest.fn(),
}));
jest.mock('services/features/generalApplication/generalApplicationService', () => ({
  getApplicationFromGAService: jest.fn(),
}));
jest.mock('modules/draft-store/paymentSessionStoreService', () => ({
  saveUserId: jest.fn().mockResolvedValue(undefined),
}));
import {getRedirectUrl} from 'services/features/generalApplication/fee/helpWithFeeService';
import {YesNo} from 'common/form/models/yesNo';
import {FeeType} from 'common/form/models/helpWithFees/feeType';
import {GeneralApplication} from 'common/models/generalApplication/GeneralApplication';
import {ApplicationTypeOption} from 'common/models/generalApplication/applicationType';
import {Claim} from 'common/models/claim';
import {GenericYesNo} from 'common/form/models/genericYesNo';
import {getGaFeePaymentRedirectInformation, getGaFeePaymentStatus} from 'services/features/generalApplication/applicationFee/generalApplicationFeePaymentService';
import {saveDraftClaim} from 'modules/draft-store/draftStoreService';
import {getDraftGAHWFDetails, saveDraftGAHWFDetails} from 'modules/draft-store/gaHwFeesDraftStore';
import {getApplicationFromGAService} from 'services/features/generalApplication/generalApplicationService';
import {saveUserId} from 'modules/draft-store/paymentSessionStoreService';
import {getClaimById} from 'modules/utilityService';
import {civilServiceClientMock} from '../../setup/sharedMocks';

const CLAIM_ID = '1640995200000000';
const APP_ID = 'GA-1001';
const USER_ID = 'ga-user';

const buildClaim = (): Claim => {
  const claim = new Claim();
  claim.id = CLAIM_ID;
  claim.generalApplication = Object.assign(new GeneralApplication(), {
    applicationTypes: [{option: ApplicationTypeOption.EXTEND_TIME}],
  });
  return claim;
};

type MinimalReq = {
  params: {id: string; appId: string};
  query: Record<string, unknown>;
  originalUrl: string;
  session: {user: {id: string}};
};

const buildReq = (overrides: Partial<MinimalReq> = {}) => ({
  params: {id: CLAIM_ID, appId: APP_ID},
  query: {},
  originalUrl: `/case/${CLAIM_ID}/general-application/${APP_ID}/apply-help-fee-selection`,
  session: {user: {id: USER_ID}},
  ...overrides,
}) as unknown as MinimalReq;

describe('Integration: GA helpWithFeeService routing branches', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (saveDraftClaim as jest.Mock).mockResolvedValue(undefined);
  });

  it.each([YesNo.NO, YesNo.YES])('maps the selected collection item to its own GA case reference for %s without borrowing another fee', async option => {
    const selectedCase = '9990000000000002';
    const claim = buildClaim();
    claim.generalApplication.applicationFee = {calculatedAmountInPence: 99900} as GeneralApplication['applicationFee'];
    const linked = Object.assign(new Claim(), {generalApplications: [
      {id: 'unrelated-entry', value: {caseLink: {CaseReference: '9990000000000001'}}},
      {id: 'selected-entry', value: {caseLink: {CaseReference: selectedCase}}},
    ]});
    civilServiceClientMock.retrieveClaimDetails.mockResolvedValue(linked);
    (getClaimById as jest.Mock).mockResolvedValue(claim);
    (getGaFeePaymentRedirectInformation as jest.Mock).mockResolvedValue({paymentReference: 'selected-payment', nextUrl: '/selected-payment'});
    (getGaFeePaymentStatus as jest.Mock).mockResolvedValue({status: 'Pending'});
    (getDraftGAHWFDetails as jest.Mock).mockResolvedValue({existing: 'keep'});
    (getApplicationFromGAService as jest.Mock).mockResolvedValue({case_data: {}});
    const writes: {key: string; value: unknown}[] = [];
    (saveDraftGAHWFDetails as jest.Mock).mockImplementation(async (key, value) => {
      writes.push({key, value: JSON.parse(JSON.stringify(value))});
    });
    const req = buildReq({query: {id: 'selected-entry', appFee: '0'}});
    const answer = new GenericYesNo(option);

    const url = await getRedirectUrl(CLAIM_ID, answer, 'applyHelpWithFees', req as never);

    if (option === YesNo.NO) {
      expect(getGaFeePaymentRedirectInformation).toHaveBeenCalledWith(selectedCase, req);
      expect(getGaFeePaymentStatus).toHaveBeenCalledWith(selectedCase, 'selected-payment', req);
      expect(url).toBe('/selected-payment');
    } else {
      expect(getApplicationFromGAService).toHaveBeenCalledWith(req, selectedCase);
      expect(getDraftGAHWFDetails).toHaveBeenCalledWith(selectedCase + USER_ID);
      expect(writes).toEqual([{key: selectedCase + USER_ID, value: {
        existing: 'keep', applicationFee: '0', applyHelpWithFees: JSON.parse(JSON.stringify(answer)),
      }}]);
      expect(url).toContain(`/case/${CLAIM_ID}/general-application/${selectedCase}/`);
    }
  });

  it('returns confirmation URL when payment status is Success', async () => {
    const claim = buildClaim();
    claim.generalApplication.applicationFeePaymentDetails = {paymentReference: 'REF-1', nextUrl: 'https://pay/old'} as unknown as never;
    (getClaimById as jest.Mock).mockResolvedValue(claim);
    (getGaFeePaymentStatus as jest.Mock).mockResolvedValue({status: 'Success'});

    const url = await getRedirectUrl(CLAIM_ID, new GenericYesNo(YesNo.NO, ''), 'applyHelpWithFees', buildReq() as never);

    expect(url).toBe(`/general-application/payment-confirmation/${CLAIM_ID}/gaid/${APP_ID}`);
    expect(saveUserId).toHaveBeenCalledWith(CLAIM_ID, FeeType.GENERALAPPLICATION, USER_ID);
  });

  it('returns refreshed gateway URL when payment status is Failed', async () => {
    const claim = buildClaim();
    claim.generalApplication.applicationFeePaymentDetails = {paymentReference: 'REF-1', nextUrl: 'https://pay/old'} as unknown as never;
    (getClaimById as jest.Mock).mockResolvedValue(claim);
    (getGaFeePaymentStatus as jest.Mock).mockResolvedValue({status: 'Failed'});
    (getGaFeePaymentRedirectInformation as jest.Mock).mockResolvedValue({paymentReference: 'REF-2', nextUrl: 'https://pay/new'});

    const url = await getRedirectUrl(CLAIM_ID, new GenericYesNo(YesNo.NO, ''), 'applyHelpWithFees', buildReq() as never);

    expect(url).toBe('https://pay/new');
    expect(saveDraftClaim).toHaveBeenCalled();
  });

  it('returns existing gateway URL for non-terminal statuses', async () => {
    const claim = buildClaim();
    claim.generalApplication.applicationFeePaymentDetails = {paymentReference: 'REF-1', nextUrl: 'https://pay/current'} as unknown as never;
    (getClaimById as jest.Mock).mockResolvedValue(claim);
    (getGaFeePaymentStatus as jest.Mock).mockResolvedValue({status: 'Created'});

    const url = await getRedirectUrl(CLAIM_ID, new GenericYesNo(YesNo.NO, ''), 'applyHelpWithFees', buildReq() as never);

    expect(url).toBe('https://pay/current');
  });

  it('routes YES branch to apply-help-with-fees and persists HWF details (including additional fee)', async () => {
    const claim = buildClaim();
    (getClaimById as jest.Mock).mockResolvedValue(claim);
    (getDraftGAHWFDetails as jest.Mock).mockResolvedValue({applyHelpWithFees: {}, applicationFee: '0'});
    (getApplicationFromGAService as jest.Mock).mockResolvedValue({
      case_data: {
        generalAppPBADetails: {
          additionalPaymentServiceRef: 'ADDITIONAL-REF',
          fee: {calculatedAmountInPence: '30300'},
        },
      },
    });
    const req = buildReq({query: {appFee: '303'}});

    const url = await getRedirectUrl(CLAIM_ID, new GenericYesNo(YesNo.YES, ''), 'applyHelpWithFees', req as never);

    expect(url).toBe(`/case/${CLAIM_ID}/general-application/${APP_ID}/apply-help-with-fees?additionalFeeTypeFlag=true`);
    expect(saveDraftGAHWFDetails).toHaveBeenCalled();
  });
});
