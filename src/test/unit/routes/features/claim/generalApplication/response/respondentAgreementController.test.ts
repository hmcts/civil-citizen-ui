import {Response} from 'express';
import respondentAgreementController from '../../../../../../../main/routes/features/generalApplication/response/respondentAgreementController';
import {GA_RESPONDENT_WANT_TO_UPLOAD_DOCUMENT_URL} from 'routes/urls';
import {Claim} from 'models/claim';
import {PartyType} from 'models/partyType';
import {GaResponse} from 'models/generalApplication/response/gaResponse';
import {ApplicationTypeOption} from 'models/generalApplication/applicationType';
import {YesNo} from 'form/models/yesNo';
import {constructResponseUrlWithIdAndAppIdParams} from 'common/utils/urlFormatter';
import {getRespondToApplicationCaption} from 'services/features/generalApplication/response/generalApplicationResponseService';
import * as draftStoreService from 'modules/draft-store/draftStoreService';
import * as gaStoreResponseService from 'services/features/generalApplication/response/generalApplicationResponseStoreService';
import {createMockResponse, getRouteHandler} from '../../../../../../utils/getRouteHandler';

jest.mock('modules/draft-store/draftStoreService');
jest.mock('services/features/generalApplication/response/generalApplicationResponseStoreService', () => ({
  saveDraftGARespondentResponse: jest.fn(),
  getDraftGARespondentResponse: jest.fn(),
}));

describe('General Application - respondent agreement', () => {
  const getHandler = getRouteHandler(respondentAgreementController, 'get');
  const postHandler = getRouteHandler(respondentAgreementController, 'post');
  const viewPath = 'features/generalApplication/respondent-agreement';
  const claimId = '12345';
  const appId = 'GA-1001';
  const applicationType = [ApplicationTypeOption.STAY_THE_CLAIM];
  let req: {params: {id: string; appId: string}; body: Record<string, unknown>; cookies: {lang: string}; query: Record<string, unknown>};
  let res: ReturnType<typeof createMockResponse>;
  let next: jest.Mock;
  let gaResponse: GaResponse;
  const mockGetCaseData = draftStoreService.getCaseDataFromStore as jest.Mock;
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
    gaResponse.generalApplicationType = applicationType;
    (draftStoreService.generateRedisKey as jest.Mock).mockReturnValue(claimId);
    (draftStoreService.generateRedisKeyForGA as jest.Mock).mockReturnValue('ga-12345');
    mockGetCaseData.mockResolvedValue(buildClaim());
    (draftStoreService.saveDraftClaim as jest.Mock).mockResolvedValue(undefined);
    mockGetDraft.mockResolvedValue(gaResponse);
    mockSaveDraft.mockResolvedValue(undefined);
  });

  describe('on GET', () => {
    it('should render the agreement page with the application caption', async () => {
      await getHandler(req as never, res as unknown as Response, next);
      await new Promise((resolve) => setImmediate(resolve));

      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({
        caption: getRespondToApplicationCaption(applicationType, 'en'),
      }));
      expect(next).not.toHaveBeenCalled();
    });

    it('should reject when loading the claim fails', async () => {
      const error = new Error('redis failure');
      mockGetCaseData.mockRejectedValue(error);

      await expect(getHandler(req as never, res as unknown as Response, next)).rejects.toBe(error);
    });
  });

  describe('on POST', () => {
    it('should save and redirect when the respondent agrees', async () => {
      req.body = {option: YesNo.YES};

      await postHandler(req as never, res as unknown as Response, next);

      expect(gaResponse.respondentAgreement?.option).toBe(YesNo.YES);
      expect(res.redirect).toHaveBeenCalledWith(
        constructResponseUrlWithIdAndAppIdParams(claimId, appId, GA_RESPONDENT_WANT_TO_UPLOAD_DOCUMENT_URL),
      );
    });

    it('should re-render when no option is selected', async () => {
      req.body = {option: null};

      await postHandler(req as never, res as unknown as Response, next);

      expect((res.render as jest.Mock).mock.calls[0][1].form.hasErrors()).toBe(true);
      expect(mockSaveDraft).not.toHaveBeenCalled();
    });

    it('should re-render when no is selected without a reason', async () => {
      req.body = {option: YesNo.NO};

      await postHandler(req as never, res as unknown as Response, next);

      expect((res.render as jest.Mock).mock.calls[0][1].form.hasErrors()).toBe(true);
      expect(mockSaveDraft).not.toHaveBeenCalled();
    });

    it('should call next when saving fails', async () => {
      const error = new Error('redis failure');
      mockSaveDraft.mockRejectedValue(error);
      req.body = {option: YesNo.YES};

      await postHandler(req as never, res as unknown as Response, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });
});
