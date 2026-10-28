import {Request, Response} from 'express';
import paymentDateController from '../../../../../../../main/routes/features/response/admission/partialAdmission/paymentDateController';
import {paymentDateService} from 'services/features/response/admission/fullAdmission/paymentOption/paymentDateService';
import {RESPONSE_TASK_LIST_URL} from 'routes/urls';
import {ResponseType} from 'form/models/responseType';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {createMockResponse, getRouteHandler} from '../../../../../../utils/getRouteHandler';

describe('Payment date', () => {
  const getHandler = getRouteHandler(paymentDateController, 'get');
  const postHandler = getRouteHandler(paymentDateController, 'post');
  const viewPath = 'features/response/admission/payment-date';
  const title = 'PAGES.ADMISSION_PAYMENT_DATE.TITLE';
  const claimId = '12345';
  let req: Partial<Request>;
  let res: ReturnType<typeof createMockResponse>;
  let next: jest.Mock;
  let mockGetPaymentDate: jest.SpyInstance;
  let mockSavePaymentDate: jest.SpyInstance;

  const expectValidationError = () => {
    expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({
      form: expect.anything(),
      title,
    }));
    expect((res.render as jest.Mock).mock.calls[0][1].form.hasErrors()).toBe(true);
    expect(res.redirect).not.toHaveBeenCalled();
    expect(mockSavePaymentDate).not.toHaveBeenCalled();
  };

  beforeEach(() => {
    req = {params: {id: claimId}, body: {}, query: {}, cookies: {}};
    res = createMockResponse();
    next = jest.fn();
    mockGetPaymentDate = jest.spyOn(paymentDateService, 'getPaymentDate').mockResolvedValue(undefined);
    mockSavePaymentDate = jest.spyOn(paymentDateService, 'savePaymentDate').mockResolvedValue(undefined);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('on GET', () => {
    it('should render the payment date page', async () => {
      await getHandler(req as Request, res as unknown as Response, next);

      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({
        form: expect.anything(),
        title,
      }));
      expect(mockGetPaymentDate).toHaveBeenCalledWith(expect.anything(), ResponseType.PART_ADMISSION);
      expect(next).not.toHaveBeenCalled();
    });

    it('should call next when loading the claim fails', async () => {
      const error = new Error('draft failure');
      mockGetPaymentDate.mockRejectedValue(error);

      await getHandler(req as Request, res as unknown as Response, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('on POST', () => {
    it('should re-render when no date is provided', async () => {
      req.body = {year: '', month: '', day: ''};

      await postHandler(req as Request, res as unknown as Response, next);

      expectValidationError();
    });

    it('should re-render when the date is in the past', async () => {
      req.body = {year: '1999', month: '1', day: '1'};

      await postHandler(req as Request, res as unknown as Response, next);

      expectValidationError();
    });

    it('should re-render when the year is missing', async () => {
      req.body = {year: '', month: '1', day: '1'};

      await postHandler(req as Request, res as unknown as Response, next);

      expectValidationError();
    });

    it('should save and redirect to the task list for a valid future date', async () => {
      req.body = {year: '9999', month: '1', day: '1'};

      await postHandler(req as Request, res as unknown as Response, next);

      expect(mockSavePaymentDate).toHaveBeenCalledWith(
        expect.anything(),
        expect.any(Date),
        ResponseType.PART_ADMISSION,
      );
      expect(res.redirect).toHaveBeenCalledWith(constructResponseUrlWithIdParams(claimId, RESPONSE_TASK_LIST_URL));
      expect(next).not.toHaveBeenCalled();
    });

    it('should call next when saving fails', async () => {
      const error = new Error('draft failure');
      mockSavePaymentDate.mockRejectedValue(error);
      req.body = {year: '9999', month: '12', day: '31'};

      await postHandler(req as Request, res as unknown as Response, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });
});
