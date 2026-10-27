import {Request, Response} from 'express';
import citizenResponseTypeController from '../../../../../../main/routes/features/response/responseType/citizenResponseTypeController';
import {
  CITIZEN_ALREADY_PAID_URL,
  CITIZEN_REJECT_ALL_CLAIM_URL,
  RESPONSE_TASK_LIST_URL,
} from 'routes/urls';
import {Claim} from 'models/claim';
import {Party} from 'models/party';
import {ResponseType} from 'form/models/responseType';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {getResponseClaimById} from 'modules/draft-store/response/responseDraftStoreService';
import {saveResponseType} from 'services/features/response/responseType/citizenResponseTypeService';
import {createMockResponse, getRouteHandler} from '../../../../../utils/getRouteHandler';

jest.mock('modules/draft-store/response/responseDraftStoreService');
jest.mock('services/features/response/responseType/citizenResponseTypeService');

describe('Citizen response type', () => {
  const getHandler = getRouteHandler(citizenResponseTypeController, 'get');
  const postHandler = getRouteHandler(citizenResponseTypeController, 'post');
  const viewPath = 'features/response/citizenResponseType/citizen-response-type';
  const claimId = '12345';
  let req: Partial<Request>;
  let res: ReturnType<typeof createMockResponse>;
  let next: jest.Mock;
  const mockGetResponseClaimById = getResponseClaimById as jest.Mock;
  const mockSaveResponseType = saveResponseType as jest.Mock;

  const stubClaim = (): Claim => new Claim();

  const claimWithResponseType = (responseType: string): Claim => {
    const claim = new Claim();
    claim.respondent1 = new Party();
    claim.respondent1.responseType = responseType;
    return claim;
  };

  beforeEach(() => {
    req = {params: {id: claimId}, body: {}, query: {}, cookies: {}};
    res = createMockResponse();
    next = jest.fn();
    jest.clearAllMocks();
    mockGetResponseClaimById.mockResolvedValue(stubClaim());
    mockSaveResponseType.mockResolvedValue(undefined);
  });

  describe('on GET', () => {
    it('should render the response type page', async () => {
      await getHandler(req as Request, res as unknown as Response, next);

      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({
        componentDetailItemsList: expect.any(Array),
      }));
      expect((res.render as jest.Mock).mock.calls[0][1].form.model.responseType).toBeUndefined();
      expect(mockGetResponseClaimById).toHaveBeenCalled();
      expect(next).not.toHaveBeenCalled();
    });

    it('should render the response type stored on the claim', async () => {
      mockGetResponseClaimById.mockResolvedValue(claimWithResponseType('test'));

      await getHandler(req as Request, res as unknown as Response, next);

      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({
        componentDetailItemsList: expect.any(Array),
      }));
      expect((res.render as jest.Mock).mock.calls[0][1].form.model.responseType).toBe('test');
    });

    it('should call next when loading the claim fails', async () => {
      const error = new Error('draft failure');
      mockGetResponseClaimById.mockRejectedValue(error);

      await getHandler(req as Request, res as unknown as Response, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('on POST', () => {
    it('should re-render when no response type is selected', async () => {
      await postHandler(req as Request, res as unknown as Response, next);

      expect(res.render).toHaveBeenCalledWith(viewPath, expect.any(Object));
      expect((res.render as jest.Mock).mock.calls[0][1].form.hasErrors()).toBe(true);
      expect(mockSaveResponseType).not.toHaveBeenCalled();
    });

    it('should save and redirect to the task list for an unrecognised response type', async () => {
      req.body = {responseType: 'test'};

      await postHandler(req as Request, res as unknown as Response, next);

      expect(mockSaveResponseType).toHaveBeenCalledWith(expect.anything(), 'test');
      expect(res.redirect).toHaveBeenCalledWith(constructResponseUrlWithIdParams(claimId, RESPONSE_TASK_LIST_URL));
    });

    it('should redirect to already paid when PART_ADMISSION is selected', async () => {
      req.body = {responseType: ResponseType.PART_ADMISSION};

      await postHandler(req as Request, res as unknown as Response, next);

      expect(mockSaveResponseType).toHaveBeenCalledWith(expect.anything(), ResponseType.PART_ADMISSION);
      expect(res.redirect).toHaveBeenCalledWith(constructResponseUrlWithIdParams(claimId, CITIZEN_ALREADY_PAID_URL));
    });

    it('should redirect to the task list when FULL_ADMISSION is selected', async () => {
      req.body = {responseType: ResponseType.FULL_ADMISSION};

      await postHandler(req as Request, res as unknown as Response, next);

      expect(res.redirect).toHaveBeenCalledWith(constructResponseUrlWithIdParams(claimId, RESPONSE_TASK_LIST_URL));
    });

    it('should redirect to reject all of the claim when FULL_DEFENCE is selected', async () => {
      req.body = {responseType: ResponseType.FULL_DEFENCE};

      await postHandler(req as Request, res as unknown as Response, next);

      expect(res.redirect).toHaveBeenCalledWith(constructResponseUrlWithIdParams(claimId, CITIZEN_REJECT_ALL_CLAIM_URL));
    });

    it('should call next when saving fails', async () => {
      const error = new Error('draft failure');
      mockSaveResponseType.mockRejectedValue(error);
      req.body = {responseType: 'test'};

      await postHandler(req as Request, res as unknown as Response, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });
});
