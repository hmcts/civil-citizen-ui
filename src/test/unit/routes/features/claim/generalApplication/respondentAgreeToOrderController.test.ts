import {Response} from 'express';
import respondentAgreeToOrderController from '../../../../../../main/routes/features/generalApplication/respondentAgreeToOrderController';
import {GA_RESPONDENT_AGREEMENT_URL, GA_RESPONDENT_WANT_TO_UPLOAD_DOCUMENT_URL} from 'routes/urls';
import {Claim} from 'models/claim';
import {PartyType} from 'models/partyType';
import {ApplicationTypeOption} from 'models/generalApplication/applicationType';
import {GaResponse} from 'models/generalApplication/response/gaResponse';
import {constructResponseUrlWithIdAndAppIdParams} from 'common/utils/urlFormatter';
import {getRespondToApplicationCaption} from 'services/features/generalApplication/response/generalApplicationResponseService';
import {
  getDraftGARespondentResponse,
  saveDraftGARespondentResponse,
} from 'services/features/generalApplication/response/generalApplicationResponseStoreService';
import * as draftStoreService from 'modules/draft-store/draftStoreService';
import {getClaimById} from 'modules/utilityService';
import {createMockResponse, getRouteHandler} from '../../../../../utils/getRouteHandler';

jest.mock('modules/draft-store/draftStoreService');
jest.mock('modules/utilityService', () => ({
  getClaimById: jest.fn(),
}));
jest.mock('services/features/generalApplication/response/generalApplicationResponseStoreService', () => ({
  getDraftGARespondentResponse: jest.fn(),
  saveDraftGARespondentResponse: jest.fn(),
}));

describe('General Application - Respondent Agree to order', () => {
  const getHandler = getRouteHandler(respondentAgreeToOrderController, 'get');
  const postHandler = getRouteHandler(respondentAgreeToOrderController, 'post');
  const viewPath = 'features/generalApplication/agree-to-order';
  const claimId = '12345';
  const appId = '345';
  let claim: Claim;
  let gaResponse: GaResponse;
  let req: {
    params: {id: string; appId: string};
    body: Record<string, unknown>;
    query: Record<string, unknown>;
    cookies: Record<string, unknown>;
    session: {user: {id: string}};
  };
  let res: ReturnType<typeof createMockResponse>;
  let next: jest.Mock;
  const mockGetCaseData = draftStoreService.getCaseDataFromStore as jest.Mock;
  const mockSaveDraftClaim = draftStoreService.saveDraftClaim as jest.Mock;
  const mockGetClaim = getClaimById as jest.Mock;
  const mockGetDraftResponse = getDraftGARespondentResponse as jest.Mock;
  const mockSaveDraftResponse = saveDraftGARespondentResponse as jest.Mock;

  const buildClaim = (): Claim => {
    const builtClaim = new Claim();
    builtClaim.applicant1 = {
      type: PartyType.INDIVIDUAL,
      partyDetails: {title: 'Mr', firstName: 'Jan', lastName: 'Clark'},
    } as Claim['applicant1'];
    builtClaim.respondentGaAppDetails = [{
      generalAppTypes: [ApplicationTypeOption.ADJOURN_HEARING],
      gaApplicationId: appId,
      caseState: '',
      generalAppSubmittedDateGAspec: '',
    }];
    return builtClaim;
  };

  beforeEach(() => {
    jest.clearAllMocks();
    claim = buildClaim();
    gaResponse = new GaResponse();
    gaResponse.generalApplicationType = [ApplicationTypeOption.ADJOURN_HEARING];
    req = {
      params: {id: claimId, appId},
      body: {},
      query: {},
      cookies: {},
      session: {user: {id: 'u1'}},
    };
    res = createMockResponse();
    next = jest.fn();
    (draftStoreService.generateRedisKey as jest.Mock).mockReturnValue(claimId);
    (draftStoreService.generateRedisKeyForGA as jest.Mock).mockReturnValue('ga-12345');
    mockGetCaseData.mockResolvedValue(claim);
    mockSaveDraftClaim.mockResolvedValue(undefined);
    mockGetClaim.mockResolvedValue(claim);
    mockGetDraftResponse.mockResolvedValue(gaResponse);
    mockSaveDraftResponse.mockResolvedValue(undefined);
  });

  describe('on GET', () => {
    it('should render the agree to order page', async () => {
      await getHandler(req as never, res as unknown as Response, next);

      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({
        caption: getRespondToApplicationCaption([ApplicationTypeOption.ADJOURN_HEARING], undefined),
      }));
      expect(next).not.toHaveBeenCalled();
    });

    it('should call next when loading the claim fails', async () => {
      const error = new Error('redis failure');
      mockGetClaim.mockRejectedValue(error);

      await getHandler(req as never, res as unknown as Response, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('on POST', () => {
    it('should save and redirect to upload documents when the respondent agrees', async () => {
      req.body = {option: 'yes'};

      await postHandler(req as never, res as unknown as Response, next);

      expect(mockSaveDraftResponse).toHaveBeenCalled();
      expect(res.redirect).toHaveBeenCalledWith(
        constructResponseUrlWithIdAndAppIdParams(claimId, appId, GA_RESPONDENT_WANT_TO_UPLOAD_DOCUMENT_URL),
      );
    });

    it('should save and redirect to respondent agreement when the respondent does not agree', async () => {
      req.body = {option: 'no'};

      await postHandler(req as never, res as unknown as Response, next);

      expect(res.redirect).toHaveBeenCalledWith(
        constructResponseUrlWithIdAndAppIdParams(claimId, appId, GA_RESPONDENT_AGREEMENT_URL),
      );
    });

    it('should re-render when no option is selected', async () => {
      req.body = {option: null};

      await postHandler(req as never, res as unknown as Response, next);

      expect(res.render).toHaveBeenCalledWith(viewPath, expect.anything());
      expect((res.render as jest.Mock).mock.calls[0][1].form.hasErrors()).toBe(true);
      expect(mockSaveDraftResponse).not.toHaveBeenCalled();
    });

    it('should call next when loading the claim fails', async () => {
      const error = new Error('redis failure');
      mockGetClaim.mockRejectedValue(error);
      req.body = {option: 'yes'};

      await postHandler(req as never, res as unknown as Response, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });
});
