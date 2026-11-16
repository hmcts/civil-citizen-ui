import {Response} from 'express';
import {GaServiceClient} from 'client/gaServiceClient';
import {Claim} from 'common/models/claim';
import {GaResponse} from 'models/generalApplication/response/gaResponse';
import {constructResponseUrlWithIdAndAppIdParams} from 'common/utils/urlFormatter';
import {getClaimById} from 'modules/utilityService';
import * as draftStoreService from 'modules/draft-store/draftStoreService';
import {getDraftGARespondentResponse} from 'services/features/generalApplication/response/generalApplicationResponseStoreService';
import {
  GA_UPLOAD_WRITTEN_REPRESENTATION_DOCS_CYA_URL,
  GA_UPLOAD_WRITTEN_REPRESENTATION_DOCS_URL,
} from 'routes/urls';
import respondWrittenRepController from '../../../../../../../main/routes/features/generalApplication/writtenRepresentationDocs/respondToWrittenRepController';
import {createMockResponse, getRouteHandler} from '../../../../../../utils/getRouteHandler';

jest.mock('modules/draft-store/draftStoreService');
jest.mock('modules/utilityService', () => ({
  getClaimById: jest.fn(),
}));
jest.mock('services/features/generalApplication/response/generalApplicationResponseStoreService', () => ({
  getDraftGARespondentResponse: jest.fn(),
  saveDraftGARespondentResponse: jest.fn(),
}));

describe('General Application - respond written representation', () => {
  const getHandler = getRouteHandler(respondWrittenRepController, 'get');
  const postHandler = getRouteHandler(respondWrittenRepController, 'post');
  const viewPath = 'features/generalApplication/additionalInfoUpload/respondToWrittenRepInfo';
  const claimId = '12345';
  const appId = 'GA-1001';
  const mockGetClaimById = getClaimById as jest.Mock;
  const mockGetResponse = getDraftGARespondentResponse as jest.Mock;
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
    response.writtenRepText = 'Written Rep';
    mockGetClaimById.mockResolvedValue(new Claim());
    mockGetResponse.mockResolvedValue(response);
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
  });

  describe('on POST', () => {
    it('should re-render when no option or text is provided', async () => {
      req.body = {option: null, writtenRepText: null};

      await postHandler(req as never, res as unknown as Response, next);

      expect((res.render as jest.Mock).mock.calls[0][1].form.hasErrors()).toBe(true);
    });

    it('should re-render when no is selected without any text', async () => {
      req.body = {option: 'no', writtenRepText: null};

      await postHandler(req as never, res as unknown as Response, next);

      expect((res.render as jest.Mock).mock.calls[0][1].form.hasErrors()).toBe(true);
    });

    it('should re-render when text is entered but no option is selected', async () => {
      req.body = {writtenRepText: 'something'};

      await postHandler(req as never, res as unknown as Response, next);

      expect((res.render as jest.Mock).mock.calls[0][1].form.hasErrors()).toBe(true);
    });

    it('should save and redirect to the upload page when yes is selected', async () => {
      req.body = {option: 'yes'};

      await postHandler(req as never, res as unknown as Response, next);

      expect(res.redirect).toHaveBeenCalledWith(
        constructResponseUrlWithIdAndAppIdParams(claimId, appId, GA_UPLOAD_WRITTEN_REPRESENTATION_DOCS_URL),
      );
    });

    it('should save and redirect to check your answers when no is selected with text', async () => {
      req.body = {option: 'no', writtenRepText: 'Written detail'};

      await postHandler(req as never, res as unknown as Response, next);

      expect(res.redirect).toHaveBeenCalledWith(
        constructResponseUrlWithIdAndAppIdParams(claimId, appId, GA_UPLOAD_WRITTEN_REPRESENTATION_DOCS_CYA_URL),
      );
    });
  });
});
