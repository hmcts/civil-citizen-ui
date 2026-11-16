import {Response} from 'express';
import {GaServiceClient} from 'client/gaServiceClient';
import {Claim} from 'common/models/claim';
import {ApplicationEvent} from 'common/models/gaEvents/applicationEvent';
import {constructResponseUrlWithIdAndAppIdParams} from 'common/utils/urlFormatter';
import {getClaimById} from 'modules/utilityService';
import * as draftStoreService from 'modules/draft-store/draftStoreService';
import {getGADocumentsFromDraftStore} from 'modules/draft-store/draftGADocumentService';
import {GA_UPLOAD_DOCUMENT_DIRECTIONS_ORDER_CONFIRMATION_URL} from 'routes/urls';
import gaDirectionOrderCheckAnswersController from '../../../../../../../main/routes/features/generalApplication/directionsOrderUpload/checkAnswerController';
import {createMockResponse, getRouteHandler} from '../../../../../../utils/getRouteHandler';

jest.mock('modules/draft-store/draftStoreService');
jest.mock('modules/utilityService', () => ({
  getClaimById: jest.fn(),
  getRedisStoreForSession: jest.fn(),
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

describe('General Application - directions order check answers', () => {
  const getHandler = getRouteHandler(gaDirectionOrderCheckAnswersController, 'get');
  const postHandler = getRouteHandler(gaDirectionOrderCheckAnswersController, 'post');
  const viewPath = 'features/generalApplication/directionsOrderUpload/check-answers';
  const claimId = '12345';
  const appId = 'GA-1001';
  const mockGetClaimById = getClaimById as jest.Mock;
  const mockGetDocuments = getGADocumentsFromDraftStore as jest.Mock;
  const submitEvent = jest.spyOn(GaServiceClient.prototype, 'submitEvent');
  let req: {params: {id: string; appId: string}; body: Record<string, unknown>; query: Record<string, unknown>; cookies: Record<string, unknown>};
  let res: ReturnType<typeof createMockResponse>;
  let next: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    req = {params: {id: claimId, appId}, body: {}, query: {}, cookies: {}};
    res = createMockResponse();
    next = jest.fn();
    mockGetClaimById.mockResolvedValue(new Claim());
    mockGetDocuments.mockResolvedValue([]);
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
    it('should submit the documents and redirect to the confirmation page', async () => {
      await postHandler(req as never, res as unknown as Response, next);

      expect(submitEvent).toHaveBeenCalledWith(
        ApplicationEvent.RESPOND_TO_JUDGE_DIRECTIONS,
        appId,
        expect.objectContaining({generalAppDirOrderUpload: []}),
        expect.anything(),
      );
      expect(res.redirect).toHaveBeenCalledWith(
        constructResponseUrlWithIdAndAppIdParams(claimId, appId, GA_UPLOAD_DOCUMENT_DIRECTIONS_ORDER_CONFIRMATION_URL),
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
