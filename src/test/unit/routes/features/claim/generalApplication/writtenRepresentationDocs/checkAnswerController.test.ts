import {Response} from 'express';
import {GaServiceClient} from 'client/gaServiceClient';
import {Claim} from 'common/models/claim';
import {GaResponse} from 'models/generalApplication/response/gaResponse';
import {ApplicationEvent} from 'common/models/gaEvents/applicationEvent';
import {constructResponseUrlWithIdAndAppIdParams} from 'common/utils/urlFormatter';
import {getClaimById} from 'modules/utilityService';
import * as draftStoreService from 'modules/draft-store/draftStoreService';
import {getGADocumentsFromDraftStore} from 'modules/draft-store/draftGADocumentService';
import {getDraftGARespondentResponse} from 'services/features/generalApplication/response/generalApplicationResponseStoreService';
import {GA_UPLOAD_WRITTEN_REPRESENTATION_DOCS_SUBMITTED_URL} from 'routes/urls';
import gaWrittenRepresentationCheckAnswersController from '../../../../../../../main/routes/features/generalApplication/writtenRepresentationDocs/checkAnswerController';
import {createMockResponse, getRouteHandler} from '../../../../../../utils/getRouteHandler';

jest.mock('modules/draft-store/draftStoreService');
jest.mock('modules/utilityService', () => ({
  getClaimById: jest.fn(),
}));
jest.mock('modules/draft-store/draftGADocumentService', () => ({
  getGADocumentsFromDraftStore: jest.fn(),
  saveGADocumentsInDraftStore: jest.fn(),
  deleteGADocumentsFromDraftStore: jest.fn(),
}));
jest.mock('services/features/generalApplication/response/generalApplicationResponseStoreService', () => ({
  getDraftGARespondentResponse: jest.fn(),
  saveDraftGARespondentResponse: jest.fn(),
}));

describe('General Application - written representation check answers', () => {
  const getHandler = getRouteHandler(gaWrittenRepresentationCheckAnswersController, 'get');
  const postHandler = getRouteHandler(gaWrittenRepresentationCheckAnswersController, 'post');
  const viewPath = 'features/generalApplication/additionalInfoUpload/checkYourAnswer';
  const claimId = '12345';
  const appId = 'GA-1001';
  const mockGetClaimById = getClaimById as jest.Mock;
  const mockGetDocuments = getGADocumentsFromDraftStore as jest.Mock;
  const mockGetResponse = getDraftGARespondentResponse as jest.Mock;
  const submitEvent = jest.spyOn(GaServiceClient.prototype, 'submitEvent');
  let req: {params: {id: string; appId: string}; body: Record<string, unknown>; query: Record<string, unknown>; cookies: Record<string, unknown>};
  let res: ReturnType<typeof createMockResponse>;
  let next: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    req = {params: {id: claimId, appId}, body: {}, query: {}, cookies: {}};
    res = createMockResponse();
    next = jest.fn();
    const response = new GaResponse();
    response.writtenRepText = 'Written Rep Text';
    mockGetClaimById.mockResolvedValue(new Claim());
    mockGetDocuments.mockResolvedValue([]);
    mockGetResponse.mockResolvedValue(response);
    (draftStoreService.generateRedisKeyForGA as jest.Mock).mockReturnValue('ga-redis-key');
    submitEvent.mockResolvedValue(undefined);
  });

  afterAll(() => {
    submitEvent.mockRestore();
  });

  describe('on GET', () => {
    it('should render the check answers page', async () => {
      await getHandler(req as never, res as unknown as Response, next);

      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({
        headerCaption: 'PAGES.GENERAL_APPLICATION.UPLOAD_WRITTEN_REPRESENTATION_DOCUMENTS.PAGE_TITLE',
        cancelUrl: '/case/12345/generalApplication/cancel',
      }));
      expect(next).not.toHaveBeenCalled();
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

      expect(submitEvent).toHaveBeenCalledWith(
        ApplicationEvent.RESPOND_TO_JUDGE_WRITTEN_REPRESENTATION,
        appId,
        expect.objectContaining({generalAppWrittenRepText: 'Written Rep Text', generalAppWrittenRepUpload: []}),
        expect.anything(),
      );
      expect(res.redirect).toHaveBeenCalledWith(
        constructResponseUrlWithIdAndAppIdParams(claimId, appId, GA_UPLOAD_WRITTEN_REPRESENTATION_DOCS_SUBMITTED_URL),
      );
    });

    it('should call next when loading the documents fails', async () => {
      const error = new Error('redis failure');
      mockGetDocuments.mockRejectedValue(error);

      await postHandler(req as never, res as unknown as Response, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });
});
