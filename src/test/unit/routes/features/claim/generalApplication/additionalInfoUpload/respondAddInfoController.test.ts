import {Response} from 'express';
import {GaServiceClient} from 'client/gaServiceClient';
import {Claim} from 'common/models/claim';
import {GaResponse} from 'models/generalApplication/response/gaResponse';
import {constructResponseUrlWithIdAndAppIdParams} from 'common/utils/urlFormatter';
import {getClaimById} from 'modules/utilityService';
import * as draftStoreService from 'modules/draft-store/draftStoreService';
import {
  getDraftGARespondentResponse,
  saveDraftGARespondentResponse,
} from 'services/features/generalApplication/response/generalApplicationResponseStoreService';
import {
  GA_UPLOAD_DOCUMENT_FOR_ADDITIONAL_INFO_CYA_URL,
  GA_UPLOAD_DOCUMENT_FOR_ADDITIONAL_INFO_URL,
} from 'routes/urls';
import respondAddInfoController from '../../../../../../../main/routes/features/generalApplication/additionalInfoUpload/respondController';
import {createMockResponse, getRouteHandler} from '../../../../../../utils/getRouteHandler';

jest.mock('modules/draft-store/draftStoreService');
jest.mock('modules/utilityService', () => ({
  getClaimById: jest.fn(),
}));
jest.mock('services/features/generalApplication/response/generalApplicationResponseStoreService', () => ({
  getDraftGARespondentResponse: jest.fn(),
  saveDraftGARespondentResponse: jest.fn(),
}));

describe('General Application - respond additional info', () => {
  const getHandler = getRouteHandler(respondAddInfoController, 'get');
  const postHandler = getRouteHandler(respondAddInfoController, 'post');
  const viewPath = 'features/generalApplication/additionalInfoUpload/additional-info';
  const claimId = '12345';
  const appId = 'GA-1001';
  const mockGetClaimById = getClaimById as jest.Mock;
  const mockGetResponse = getDraftGARespondentResponse as jest.Mock;
  const mockSaveResponse = saveDraftGARespondentResponse as jest.Mock;
  const getApplication = jest.spyOn(GaServiceClient.prototype, 'getApplication');
  let req: {params: {id: string; appId: string}; body: Record<string, unknown>; query: Record<string, unknown>; cookies: Record<string, unknown>};
  let res: ReturnType<typeof createMockResponse>;
  let next: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    req = {params: {id: claimId, appId}, body: {}, query: {}, cookies: {}};
    res = createMockResponse();
    next = jest.fn();
    const response = new GaResponse();
    response.additionalText = 'More info';
    mockGetClaimById.mockReset().mockResolvedValue(new Claim());
    mockGetResponse.mockReset().mockResolvedValue(response);
    mockSaveResponse.mockReset().mockResolvedValue(undefined);
    (draftStoreService.generateRedisKeyForGA as jest.Mock).mockReturnValue('ga-redis-key');
    getApplication.mockResolvedValue({} as never);
  });

  afterAll(() => {
    getApplication.mockRestore();
  });

  describe('on GET', () => {
    it('should render the respond page', async () => {
      await getHandler(req as never, res as unknown as Response, next);

      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({
        headerCaption: 'PAGES.GENERAL_APPLICATION.RESPONDENT_UPLOAD_OPTION.TITLE',
      }));
      expect(next).not.toHaveBeenCalled();
    });

    it('should forward the original claim read error without rendering or redirecting', async () => {
      const error = new Error('GA additional information claim read failed');
      mockGetClaimById.mockRejectedValueOnce(error);

      await getHandler(req as never, res as unknown as Response, next);

      expect(mockGetClaimById).toHaveBeenCalledWith(claimId, req, true);
      expect(next).toHaveBeenCalledTimes(1);
      expect(next.mock.calls[0][0]).toBe(error);
      expect(res.render).not.toHaveBeenCalled();
      expect(res.redirect).not.toHaveBeenCalled();
    });
  });

  describe('on POST', () => {
    it('should forward the original save error without rendering or redirecting', async () => {
      const error = new Error('GA additional information save failed');
      req.body = {option: 'yes', additionalText: 'Additional details'};
      mockSaveResponse.mockRejectedValueOnce(error);

      await postHandler(req as never, res as unknown as Response, next);

      expect(mockSaveResponse).toHaveBeenCalledTimes(1);
      expect(mockSaveResponse).toHaveBeenCalledWith('ga-redis-key', expect.objectContaining({
        additionalText: 'Additional details',
        wantToUploadAddlDocuments: 'yes',
      }));
      expect(next).toHaveBeenCalledTimes(1);
      expect(next.mock.calls[0][0]).toBe(error);
      expect(res.render).not.toHaveBeenCalled();
      expect(res.redirect).not.toHaveBeenCalled();
    });

    it('should re-render when no option or text is provided', async () => {
      req.body = {option: null, additionalText: null};

      await postHandler(req as never, res as unknown as Response, next);

      expect(res.render).toHaveBeenCalledWith(viewPath, expect.any(Object));
      expect((res.render as jest.Mock).mock.calls[0][1].form.hasErrors()).toBe(true);
    });

    it('should re-render when no is selected without any text', async () => {
      req.body = {option: 'no', additionalText: null};

      await postHandler(req as never, res as unknown as Response, next);

      expect((res.render as jest.Mock).mock.calls[0][1].form.hasErrors()).toBe(true);
    });

    it('should save and redirect to the upload page when yes is selected', async () => {
      req.body = {option: 'yes'};

      await postHandler(req as never, res as unknown as Response, next);

      expect(res.redirect).toHaveBeenCalledWith(
        constructResponseUrlWithIdAndAppIdParams(claimId, appId, GA_UPLOAD_DOCUMENT_FOR_ADDITIONAL_INFO_URL),
      );
    });

    it('should save and redirect to check your answers when no is selected with text', async () => {
      req.body = {option: 'no', additionalText: 'More detail'};

      await postHandler(req as never, res as unknown as Response, next);

      expect(res.redirect).toHaveBeenCalledWith(
        constructResponseUrlWithIdAndAppIdParams(claimId, appId, GA_UPLOAD_DOCUMENT_FOR_ADDITIONAL_INFO_CYA_URL),
      );
    });
  });
});
