import {Response} from 'express';
import {GaServiceClient} from 'client/gaServiceClient';
import {Claim} from 'common/models/claim';
import {GeneralApplication} from 'common/models/generalApplication/GeneralApplication';
import {ApplicationEvent} from 'common/models/gaEvents/applicationEvent';
import {constructResponseUrlWithIdAndAppIdParams} from 'common/utils/urlFormatter';
import {getClaimById} from 'modules/utilityService';
import {GA_UPLOAD_ADDITIONAL_DOCUMENTS_SUBMITTED_URL} from 'routes/urls';
import {
  buildSummarySectionForAdditionalDoc,
  prepareCCDData,
} from 'services/features/generalApplication/additionalDocumentService';
import gaAdditionalDocCheckAnswerController from '../../../../../../../main/routes/features/generalApplication/additionalDocuments/checkAnswersController';
import {createMockResponse, getRouteHandler} from '../../../../../../utils/getRouteHandler';

jest.mock('modules/draft-store/draftStoreService');
jest.mock('modules/utilityService', () => ({
  getClaimById: jest.fn(),
}));
jest.mock('services/features/generalApplication/response/generalApplicationResponseStoreService', () => ({
  getDraftGARespondentResponse: jest.fn(),
  saveDraftGARespondentResponse: jest.fn(),
}));
jest.mock('services/features/generalApplication/additionalDocumentService', () => {
  const actual = jest.requireActual('services/features/generalApplication/additionalDocumentService');
  return {
    ...actual,
    buildSummarySectionForAdditionalDoc: jest.fn((...args: unknown[]) => actual.buildSummarySectionForAdditionalDoc(...args)),
    prepareCCDData: jest.fn((...args: unknown[]) => actual.prepareCCDData(...args)),
  };
});

describe('General Application - additional docs check answer controller', () => {
  const getHandler = getRouteHandler(gaAdditionalDocCheckAnswerController, 'get');
  const postHandler = getRouteHandler(gaAdditionalDocCheckAnswerController, 'post');
  const viewPath = 'features/generalApplication/additionalDocuments/check-answers';
  const claimId = '12345';
  const appId = 'GA-1001';
  const mockGetClaimById = getClaimById as jest.Mock;
  const submitEvent = jest.spyOn(GaServiceClient.prototype, 'submitEvent');
  let req: {params: {id: string; appId: string}; body: Record<string, unknown>; query: Record<string, unknown>; cookies: Record<string, unknown>};
  let res: ReturnType<typeof createMockResponse>;
  let next: jest.Mock;

  const buildClaim = (): Claim => {
    const claim = new Claim();
    claim.generalApplication = new GeneralApplication();
    return claim;
  };

  beforeEach(() => {
    jest.clearAllMocks();
    req = {params: {id: claimId, appId}, body: {}, query: {}, cookies: {}};
    res = createMockResponse();
    next = jest.fn();
    mockGetClaimById.mockResolvedValue(buildClaim());
    submitEvent.mockResolvedValue(undefined);
  });

  afterAll(() => {
    submitEvent.mockRestore();
  });

  describe('on GET', () => {
    it('should render the check answers page', async () => {
      await getHandler(req as never, res as unknown as Response, next);

      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({
        cancelUrl: '/case/12345/generalApplication/cancel',
      }));
      expect(buildSummarySectionForAdditionalDoc).toHaveBeenCalledWith([], claimId, appId, undefined);
      expect(next).not.toHaveBeenCalled();
    });

    it('should pass the welsh language into the summary', async () => {
      req.query = {lang: 'cy'};

      await getHandler(req as never, res as unknown as Response, next);

      expect(buildSummarySectionForAdditionalDoc).toHaveBeenCalledWith([], claimId, appId, 'cy');
      expect(res.render).toHaveBeenCalledWith(viewPath, expect.any(Object));
    });

    it('should call next when loading the claim fails', async () => {
      const error = new Error('redis failure');
      mockGetClaimById.mockRejectedValue(error);

      await getHandler(req as never, res as unknown as Response, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('on POST', () => {
    it('should submit the documents and redirect to the submitted page', async () => {
      await postHandler(req as never, res as unknown as Response, next);

      expect(prepareCCDData).toHaveBeenCalledWith([]);
      expect(submitEvent).toHaveBeenCalledWith(
        ApplicationEvent.UPLOAD_ADDL_DOCUMENTS,
        appId,
        {uploadDocument: []},
        expect.anything(),
      );
      expect(res.redirect).toHaveBeenCalledWith(
        constructResponseUrlWithIdAndAppIdParams(claimId, appId, GA_UPLOAD_ADDITIONAL_DOCUMENTS_SUBMITTED_URL),
      );
      expect(next).not.toHaveBeenCalled();
    });

    it('should call next when submitting fails', async () => {
      const error = new Error('submit failure');
      submitEvent.mockRejectedValue(error);

      await postHandler(req as never, res as unknown as Response, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });
});
