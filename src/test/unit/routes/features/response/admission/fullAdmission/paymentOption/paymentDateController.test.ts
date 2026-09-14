import {Response} from 'express';
import paymentDateController from '../../../../../../../../main/routes/features/response/admission/fullAdmission/paymentOption/paymentDateController';
import {RESPONSE_TASK_LIST_URL} from 'routes/urls';
import {PaymentDate} from 'form/models/admission/fullAdmission/paymentOption/paymentDate';
import {ResponseType} from 'form/models/responseType';
import {paymentDateService} from 'services/features/response/admission/fullAdmission/paymentOption/paymentDateService';
import {generateRedisKey} from 'modules/draft-store/draftStoreService';
import {AppRequest} from 'models/AppRequest';
import {GenericForm} from 'form/models/genericForm';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {createMockResponse, createMockSession, getRouteHandler} from '../../../../../../../utils/getRouteHandler';

jest.mock('modules/draft-store/draftStoreService');

describe('Payment date', () => {
  const getHandler = getRouteHandler(paymentDateController, 'get');
  const postHandler = getRouteHandler(paymentDateController, 'post');
  const viewPath = 'features/response/admission/payment-date';
  const title = 'PAGES.ADMISSION_PAYMENT_DATE.TITLE';
  const claimId = '12345';
  let req: Partial<AppRequest>;
  let res: ReturnType<typeof createMockResponse>;
  let next: jest.Mock;
  const mockGenerateRedisKey = generateRedisKey as jest.Mock;
  const mockGetPaymentDate = jest.spyOn(paymentDateService, 'getPaymentDate');
  const mockSavePaymentDate = jest.spyOn(paymentDateService, 'savePaymentDate');
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
    mockGetPaymentDate.mockResolvedValue(new PaymentDate());
    mockSavePaymentDate.mockResolvedValue(undefined);
  });

  describe('on GET', () => {
    it('should render payment date page', async () => {
      await getHandler(req as AppRequest, res as unknown as Response, next);

      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({
        form: expect.any(GenericForm),
        title,
      }));
    });

    it('should render payment date page with payment date loaded from redis', async () => {
      mockGetPaymentDate.mockResolvedValue(new PaymentDate('2025', '6', '1'));

      await getHandler(req as AppRequest, res as unknown as Response, next);

      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({
        form: expect.any(GenericForm),
        title,
      }));
      expect(renderedForm().model.year).toBe(2025);
      expect(renderedForm().model.month).toBe(6);
      expect(renderedForm().model.day).toBe(1);
    });

    it('should call next when loading the payment date fails', async () => {
      const error = new Error('error');
      mockGetPaymentDate.mockRejectedValue(error);

      await getHandler(req as AppRequest, res as unknown as Response, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('on POST', () => {
    it('should re-render with errors on no input', async () => {
      req.body = {year: '', month: '', day: ''};

      await postHandler(req as AppRequest, res as unknown as Response, next);

      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({form: expect.any(GenericForm), title}));
      expect(renderedForm().hasErrors()).toBe(true);
      expect(renderedForm().errorFor('day')).toBe('ERRORS.VALID_DAY');
      expect(renderedForm().errorFor('month')).toBe('ERRORS.VALID_MONTH');
      expect(renderedForm().errorFor('year')).toBeTruthy();
    });

    it('should re-render with error on date in the past', async () => {
      req.body = {year: '1999', month: '1', day: '1'};

      await postHandler(req as AppRequest, res as unknown as Response, next);

      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({form: expect.any(GenericForm), title}));
      expect(renderedForm().errorFor('date')).toBe('ERRORS.VALID_DATE_NOT_IN_PAST');
    });

    it('should redirect to claim task list on valid payment date', async () => {
      req.body = {year: '9999', month: '1', day: '1'};

      await postHandler(req as AppRequest, res as unknown as Response, next);

      expect(mockSavePaymentDate).toHaveBeenCalledWith(claimId, expect.any(Date), ResponseType.FULL_ADMISSION);
      expect(res.redirect).toHaveBeenCalledWith(constructResponseUrlWithIdParams(claimId, RESPONSE_TASK_LIST_URL));
    });

    it('should call next when save fails', async () => {
      const error = new Error('error');
      mockSavePaymentDate.mockRejectedValue(error);
      req.body = {year: '9999', month: '12', day: '31'};

      await postHandler(req as AppRequest, res as unknown as Response, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });
});
