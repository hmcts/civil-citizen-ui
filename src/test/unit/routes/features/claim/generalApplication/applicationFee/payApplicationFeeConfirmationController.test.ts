import {Response} from 'express';
import payApplicationFeeConfirmationController from '../../../../../../../main/routes/features/generalApplication/applicationFee/payApplicationFeeConfirmationController';
import {ApplyHelpFeesReferenceForm} from 'form/models/caseProgression/hearingFee/applyHelpFeesReferenceForm';
import {GaHelpWithFees} from 'models/generalApplication/gaHelpWithFees';
import {YesNo} from 'form/models/yesNo';
import {Claim} from 'models/claim';
import {PartyType} from 'models/partyType';
import * as draftStoreService from 'modules/draft-store/draftStoreService';
import {getClaimById} from 'modules/utilityService';
import {getDraftGAHWFDetails} from 'modules/draft-store/gaHwFeesDraftStore';
import {createMockResponse, getRouteHandler} from '../../../../../../utils/getRouteHandler';

jest.mock('modules/draft-store/draftStoreService');
jest.mock('modules/utilityService', () => ({
  getClaimById: jest.fn(),
  getRedisStoreForSession: jest.fn(),
}));

jest.mock('services/features/generalApplication/response/generalApplicationResponseStoreService', () => ({
  getDraftGARespondentResponse: jest.fn(),
  saveDraftGARespondentResponse: jest.fn(),
}));
jest.mock('modules/draft-store/gaHwFeesDraftStore', () => ({
  getDraftGAHWFDetails: jest.fn(),
  saveDraftGAHWFDetails: jest.fn(),
}));

describe('Pay GA Application Fee Confirmation Screen Controller', () => {
  const getHandler = getRouteHandler(payApplicationFeeConfirmationController, 'get');
  const viewPath = 'features/generalApplication/applicationFee/pay-application-fee-confirmation';
  const claimId = '12345';
  const appId = '67890';
  const referenceNumber = 'HWF-176A-32B';
  let req: {
    params: {id: string; appId: string};
    body: Record<string, unknown>;
    query: Record<string, string>;
    cookies: Record<string, string>;
    session: {user: {id: string}};
  };
  let res: ReturnType<typeof createMockResponse>;
  let next: jest.Mock;
  const mockGetDraft = getDraftGAHWFDetails as jest.Mock;

  const buildClaim = (): Claim => {
    const claim = new Claim();
    claim.applicant1 = {
      type: PartyType.INDIVIDUAL,
      partyDetails: {title: 'Mr', firstName: 'Jan', lastName: 'Clark'},
    } as Claim['applicant1'];
    return claim;
  };

  const draftWithReference = (): GaHelpWithFees => new GaHelpWithFees(
    {option: YesNo.YES} as GaHelpWithFees['applyHelpWithFees'],
    'yes',
    new ApplyHelpFeesReferenceForm(YesNo.YES, referenceNumber),
  );

  beforeEach(() => {
    jest.clearAllMocks();
    req = {
      params: {id: claimId, appId},
      body: {},
      query: {},
      cookies: {},
      session: {user: {id: 'user-1'}},
    };
    res = createMockResponse();
    next = jest.fn();
    (draftStoreService.generateRedisKeyForGA as jest.Mock).mockReturnValue(appId);
    (draftStoreService.deleteDraftClaimFromStore as jest.Mock).mockResolvedValue(undefined);
    (getClaimById as jest.Mock).mockResolvedValue(buildClaim());
    mockGetDraft.mockResolvedValue(draftWithReference());
  });

  it('should render the application fee confirmation when a help with fees reference exists', async () => {
    await getHandler(req as never, res as unknown as Response, next);

    expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({
      referenceNumber,
    }));
    expect(JSON.stringify((res.render as jest.Mock).mock.calls[0][1].confirmationContent))
      .toContain('COMMON.IF_NECESSARY_DOCUMENTS');
    expect(draftStoreService.deleteDraftClaimFromStore).toHaveBeenCalled();
    expect(next).not.toHaveBeenCalled();
  });

  it('should render the additional application fee confirmation when the flag is true', async () => {
    req.query = {additionalFeeTypeFlag: 'true'};

    await getHandler(req as never, res as unknown as Response, next);

    expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({
      referenceNumber,
    }));
    expect(JSON.stringify((res.render as jest.Mock).mock.calls[0][1].confirmationContent))
      .not.toContain('COMMON.IF_NECESSARY_DOCUMENTS');
  });

  it('should call next when loading the draft fails', async () => {
    const error = new Error('redis failure');
    mockGetDraft.mockRejectedValue(error);

    await getHandler(req as never, res as unknown as Response, next);

    expect(next).toHaveBeenCalledWith(error);
  });
});
