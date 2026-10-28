import {Request, Response} from 'express';
import alreadyPaidController from '../../../../../../../main/routes/features/response/admission/partialAdmission/alreadyPaidController';
import {RESPONSE_TASK_LIST_URL} from 'routes/urls';
import {PartialAdmissionService} from 'services/features/response/admission/partialAdmission/partialAdmissionService';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {createMockResponse, getRouteHandler} from '../../../../../../utils/getRouteHandler';

describe('Already Paid Controller', () => {
  const getHandler = getRouteHandler(alreadyPaidController, 'get');
  const postHandler = getRouteHandler(alreadyPaidController, 'post');
  const viewPath = 'features/response/admission/partialAdmission/already-paid';
  const claimId = '12345';
  let req: Partial<Request>;
  let res: ReturnType<typeof createMockResponse>;
  let next: jest.Mock;
  let mockGetClaimAlreadyPaid: jest.SpyInstance;
  let mockSaveClaimAlreadyPaid: jest.SpyInstance;

  beforeEach(() => {
    req = {params: {id: claimId}, body: {}, query: {}, cookies: {}};
    res = createMockResponse();
    next = jest.fn();
    mockGetClaimAlreadyPaid = jest.spyOn(PartialAdmissionService.prototype, 'getClaimAlreadyPaid')
      .mockResolvedValue(undefined);
    mockSaveClaimAlreadyPaid = jest.spyOn(PartialAdmissionService.prototype, 'saveClaimAlreadyPaid')
      .mockResolvedValue(undefined);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('on GET', () => {
    it('should render the already paid page', async () => {
      await getHandler(req as Request, res as unknown as Response, next);

      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({
        form: expect.anything(),
      }));
      expect(mockGetClaimAlreadyPaid).toHaveBeenCalled();
      expect(next).not.toHaveBeenCalled();
    });

    it('should call next when loading the claim fails', async () => {
      const error = new Error('draft failure');
      mockGetClaimAlreadyPaid.mockRejectedValue(error);

      await getHandler(req as Request, res as unknown as Response, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('on POST', () => {
    it('should re-render when no option is selected', async () => {
      await postHandler(req as Request, res as unknown as Response, next);

      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({
        form: expect.anything(),
      }));
      expect((res.render as jest.Mock).mock.calls[0][1].form.hasErrors()).toBe(true);
      expect(mockSaveClaimAlreadyPaid).not.toHaveBeenCalled();
      expect(res.redirect).not.toHaveBeenCalled();
    });

    it('should save and redirect to the task list when No is selected', async () => {
      req.body = {option: 'No'};

      await postHandler(req as Request, res as unknown as Response, next);

      expect(mockSaveClaimAlreadyPaid).toHaveBeenCalledWith(expect.anything(), 'No');
      expect(res.redirect).toHaveBeenCalledWith(constructResponseUrlWithIdParams(claimId, RESPONSE_TASK_LIST_URL));
      expect(next).not.toHaveBeenCalled();
    });

    it('should save and redirect to the task list when Yes is selected', async () => {
      req.body = {option: 'Yes'};

      await postHandler(req as Request, res as unknown as Response, next);

      expect(mockSaveClaimAlreadyPaid).toHaveBeenCalledWith(expect.anything(), 'Yes');
      expect(res.redirect).toHaveBeenCalledWith(constructResponseUrlWithIdParams(claimId, RESPONSE_TASK_LIST_URL));
      expect(next).not.toHaveBeenCalled();
    });

    it('should call next when saving fails', async () => {
      const error = new Error('draft failure');
      mockSaveClaimAlreadyPaid.mockRejectedValue(error);
      req.body = {option: 'Yes'};

      await postHandler(req as Request, res as unknown as Response, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });
});
