import {Response} from 'express';
import respondentWantToUploadDocumentsController from '../../../../../../../main/routes/features/generalApplication/response/respondentWantToUploadDocumentsController';
import {GA_RESPONDENT_HEARING_PREFERENCE_URL, GA_RESPONDENT_UPLOAD_DOCUMENT_URL} from 'routes/urls';
import {Claim} from 'models/claim';
import {PartyType} from 'models/partyType';
import {GaResponse} from 'models/generalApplication/response/gaResponse';
import {ApplicationTypeOption} from 'models/generalApplication/applicationType';
import {YesNo} from 'form/models/yesNo';
import {constructResponseUrlWithIdAndAppIdParams} from 'common/utils/urlFormatter';
import {getClaimById} from 'modules/utilityService';
import * as draftStoreService from 'modules/draft-store/draftStoreService';
import * as gaStoreResponseService from 'services/features/generalApplication/response/generalApplicationResponseStoreService';
import {createMockResponse, getRouteHandler} from '../../../../../../utils/getRouteHandler';

jest.mock('modules/draft-store/draftStoreService');
jest.mock('modules/utilityService');
jest.mock('services/features/generalApplication/response/generalApplicationResponseStoreService', () => ({
  saveDraftGARespondentResponse: jest.fn(),
  getDraftGARespondentResponse: jest.fn(),
}));

describe('General Application - Respondent want to upload document', () => {
  const getHandler = getRouteHandler(respondentWantToUploadDocumentsController, 'get');
  const postHandler = getRouteHandler(respondentWantToUploadDocumentsController, 'post');
  const viewPath = 'features/generalApplication/response/respondent-want-to-upload-documents';
  const claimId = '12345';
  const appId = 'GA-1001';
  let req: {params: {id: string; appId: string}; body: Record<string, unknown>; cookies: {lang: string}; query: Record<string, unknown>};
  let res: ReturnType<typeof createMockResponse>;
  let next: jest.Mock;
  let gaResponse: GaResponse;
  const mockGetClaim = getClaimById as jest.Mock;
  const mockGetDraft = gaStoreResponseService.getDraftGARespondentResponse as jest.Mock;
  const mockSaveDraft = gaStoreResponseService.saveDraftGARespondentResponse as jest.Mock;

  const buildClaim = (): Claim => {
    const claim = new Claim();
    claim.applicant1 = {
      type: PartyType.INDIVIDUAL,
      partyDetails: {title: 'Mr', firstName: 'Jan', lastName: 'Clark'},
    } as Claim['applicant1'];
    return claim;
  };

  beforeEach(() => {
    jest.clearAllMocks();
    req = {params: {id: claimId, appId}, body: {}, cookies: {lang: 'en'}, query: {}};
    res = createMockResponse();
    next = jest.fn();
    gaResponse = new GaResponse();
    gaResponse.generalApplicationType = [ApplicationTypeOption.ADJOURN_HEARING];
    (draftStoreService.generateRedisKey as jest.Mock).mockReturnValue(claimId);
    (draftStoreService.generateRedisKeyForGA as jest.Mock).mockReturnValue('ga-12345');
    (draftStoreService.getCaseDataFromStore as jest.Mock).mockResolvedValue(buildClaim());
    (draftStoreService.saveDraftClaim as jest.Mock).mockResolvedValue(undefined);
    mockGetClaim.mockResolvedValue(buildClaim());
    mockGetDraft.mockResolvedValue(gaResponse);
    mockSaveDraft.mockResolvedValue(undefined);
  });

  describe('on GET', () => {
    it('should render the want to upload documents page', async () => {
      await getHandler(req as never, res as unknown as Response, next);

      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({
        form: expect.anything(),
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
    it('should save and redirect to upload documents when yes is selected', async () => {
      req.body = {option: YesNo.YES};

      await postHandler(req as never, res as unknown as Response, next);

      expect(gaResponse.wantToUploadDocuments).toBe(YesNo.YES);
      expect(res.redirect).toHaveBeenCalledWith(
        constructResponseUrlWithIdAndAppIdParams(claimId, appId, GA_RESPONDENT_UPLOAD_DOCUMENT_URL),
      );
    });

    it('should save and redirect to hearing preference when no is selected', async () => {
      req.body = {option: YesNo.NO};

      await postHandler(req as never, res as unknown as Response, next);

      expect(gaResponse.wantToUploadDocuments).toBe(YesNo.NO);
      expect(res.redirect).toHaveBeenCalledWith(
        constructResponseUrlWithIdAndAppIdParams(claimId, appId, GA_RESPONDENT_HEARING_PREFERENCE_URL),
      );
    });

    it('should re-render when no option is selected', async () => {
      req.body = {option: null};

      await postHandler(req as never, res as unknown as Response, next);

      expect((res.render as jest.Mock).mock.calls[0][1].form.hasErrors()).toBe(true);
      expect(mockSaveDraft).not.toHaveBeenCalled();
    });

    it('should call next when saving fails', async () => {
      const error = new Error('redis failure');
      mockSaveDraft.mockRejectedValue(error);
      req.body = {option: YesNo.NO};

      await postHandler(req as never, res as unknown as Response, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });
});
