import {Response} from 'express';
import citizenResponseTypeController from '../../../../../../main/routes/features/response/responseType/citizenResponseTypeController';
import {
  CITIZEN_ALREADY_PAID_URL,
  CITIZEN_REJECT_ALL_CLAIM_URL,
  RESPONSE_TASK_LIST_URL,
} from 'routes/urls';
import {getCaseDataFromStore, generateRedisKey} from 'modules/draft-store/draftStoreService';
import {saveResponseType} from 'services/features/response/responseType/citizenResponseTypeService';
import {Claim} from 'models/claim';
import {Party} from 'models/party';
import {ResponseType} from 'form/models/responseType';
import {AppRequest} from 'models/AppRequest';
import {GenericForm} from 'form/models/genericForm';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {createMockResponse, createMockSession, getRouteHandler} from '../../../../../utils/getRouteHandler';

jest.mock('modules/draft-store/draftStoreService');
jest.mock('services/features/response/responseType/citizenResponseTypeService');

describe('Citizen response type', () => {
  const getHandler = getRouteHandler(citizenResponseTypeController, 'get');
  const postHandler = getRouteHandler(citizenResponseTypeController, 'post');
  const viewPath = 'features/response/citizenResponseType/citizen-response-type';
  const claimId = '12345';
  let req: Partial<AppRequest>;
  let res: ReturnType<typeof createMockResponse>;
  let next: jest.Mock;
  const mockGetCaseData = getCaseDataFromStore as jest.Mock;
  const mockGenerateRedisKey = generateRedisKey as jest.Mock;
  const mockSaveResponseType = saveResponseType as jest.Mock;
  const renderedForm = () => (res.render as jest.Mock).mock.calls[0][1].form;

  beforeEach(() => {
    req = {
      params: {id: claimId},
      session: createMockSession({user: {id: 'user-id'}}),
      body: {},
      query: {},
      cookies: {},
    };
    res = createMockResponse();
    next = jest.fn();
    mockGenerateRedisKey.mockReturnValue(claimId);
    mockGetCaseData.mockResolvedValue(new Claim());
    mockSaveResponseType.mockResolvedValue(undefined);
  });

  describe('on GET', () => {
    it('should render empty citizen response type page', async () => {
      await getHandler(req as AppRequest, res as unknown as Response, next);

      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({
        form: expect.any(GenericForm),
        componentDetailItemsList: expect.any(Array),
      }));
      expect(renderedForm().model.responseType).toBeUndefined();
    });

    it('should render citizen response type page with information from redis', async () => {
      const claim = new Claim();
      const respondent1 = new Party();
      respondent1.responseType = 'test';
      claim.respondent1 = respondent1;
      mockGetCaseData.mockResolvedValue(claim);

      await getHandler(req as AppRequest, res as unknown as Response, next);

      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({
        form: expect.any(GenericForm),
      }));
      expect(renderedForm().model.responseType).toBe('test');
    });

    it('should call next when loading the claim fails', async () => {
      const error = new Error('error');
      mockGetCaseData.mockRejectedValue(error);

      await getHandler(req as AppRequest, res as unknown as Response, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('on POST', () => {
    it('should re-render when response type is not selected', async () => {
      await postHandler(req as AppRequest, res as unknown as Response, next);

      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({form: expect.any(GenericForm)}));
      expect(renderedForm().hasErrors()).toBe(true);
      expect(renderedForm().errorFor('responseType')).toBe('ERRORS.RESPONSE_TYPE_REQUIRED');
      expect(res.redirect).not.toHaveBeenCalled();
    });

    it('should redirect when a response type is provided', async () => {
      req.body = {responseType: 'test'};

      await postHandler(req as AppRequest, res as unknown as Response, next);

      expect(mockSaveResponseType).toHaveBeenCalledWith(claimId, 'test');
      expect(res.redirect).toHaveBeenCalledWith(constructResponseUrlWithIdParams(claimId, RESPONSE_TASK_LIST_URL));
    });

    it('should redirect when a response type is provided and redis already has respondent information', async () => {
      const claim = new Claim();
      const respondent1 = new Party();
      respondent1.responseType = 'test';
      claim.respondent1 = respondent1;
      mockGetCaseData.mockResolvedValue(claim);
      req.body = {responseType: 'test'};

      await postHandler(req as AppRequest, res as unknown as Response, next);

      expect(res.redirect).toHaveBeenCalledWith(constructResponseUrlWithIdParams(claimId, RESPONSE_TASK_LIST_URL));
    });

    it('should redirect to the task list when redis has no respondent1 information', async () => {
      req.body = {responseType: 'test'};

      await postHandler(req as AppRequest, res as unknown as Response, next);

      expect(res.redirect).toHaveBeenCalledWith(constructResponseUrlWithIdParams(claimId, RESPONSE_TASK_LIST_URL));
    });

    it('should redirect to already paid when user selects I admit part of the claim', async () => {
      req.body = {responseType: ResponseType.PART_ADMISSION};

      await postHandler(req as AppRequest, res as unknown as Response, next);

      expect(res.redirect).toHaveBeenCalledWith(constructResponseUrlWithIdParams(claimId, CITIZEN_ALREADY_PAID_URL));
    });

    it('should redirect to the task list when user selects I admit all of the claim', async () => {
      req.body = {responseType: ResponseType.FULL_ADMISSION};

      await postHandler(req as AppRequest, res as unknown as Response, next);

      expect(res.redirect).toHaveBeenCalledWith(constructResponseUrlWithIdParams(claimId, RESPONSE_TASK_LIST_URL));
    });

    it('should redirect to reject claim when user selects I reject all of the claim', async () => {
      req.body = {responseType: ResponseType.FULL_DEFENCE};

      await postHandler(req as AppRequest, res as unknown as Response, next);

      expect(res.redirect).toHaveBeenCalledWith(constructResponseUrlWithIdParams(claimId, CITIZEN_REJECT_ALL_CLAIM_URL));
    });

    it('should call next when save fails', async () => {
      const error = new Error('error');
      mockSaveResponseType.mockRejectedValue(error);
      req.body = {responseType: 'test'};

      await postHandler(req as AppRequest, res as unknown as Response, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });
});
