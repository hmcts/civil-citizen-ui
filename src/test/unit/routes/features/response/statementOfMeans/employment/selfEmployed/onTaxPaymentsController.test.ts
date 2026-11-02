import {Request, Response} from 'express';
import onTaxPaymentsController from '../../../../../../../../main/routes/features/response/statementOfMeans/employment/selfEmployed/onTaxPaymentsController';
import {CITIZEN_COURT_ORDERS_URL} from 'routes/urls';
import {YesNo} from 'form/models/yesNo';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {GenericForm} from 'form/models/genericForm';
import {OnTaxPayments} from 'form/models/statementOfMeans/employment/selfEmployed/onTaxPayments';
import * as onTaxPaymentsService from 'services/features/response/statementOfMeans/employment/selfEmployed/onTaxPaymentsService';
import {createMockResponse, getRouteHandler} from '../../../../../../../utils/getRouteHandler';

jest.mock('services/features/response/statementOfMeans/employment/selfEmployed/onTaxPaymentsService', () => {
  const actual = jest.requireActual('services/features/response/statementOfMeans/employment/selfEmployed/onTaxPaymentsService');
  return {
    ...actual,
    getOnTaxPaymentsForm: jest.fn(),
    saveTaxPaymentsData: jest.fn(),
  };
});

describe('on tax payments', () => {
  const getHandler = getRouteHandler(onTaxPaymentsController, 'get');
  const postHandler = getRouteHandler(onTaxPaymentsController, 'post');
  const viewPath = 'features/response/statementOfMeans/employment/selfEmployed/on-tax-payments';
  const claimId = '12345';
  let req: Partial<Request>;
  let res: ReturnType<typeof createMockResponse>;
  let next: jest.Mock;
  const mockGetOnTaxPaymentsForm = onTaxPaymentsService.getOnTaxPaymentsForm as jest.Mock;
  const mockSaveTaxPaymentsData = onTaxPaymentsService.saveTaxPaymentsData as jest.Mock;

  const validTaxPayment = {option: YesNo.YES, amountYouOwe: 44.4, reason: 'reason'};

  beforeEach(() => {
    req = {params: {id: claimId}, body: {}, query: {}, cookies: {}};
    res = createMockResponse();
    next = jest.fn();
    jest.clearAllMocks();
    mockGetOnTaxPaymentsForm.mockResolvedValue(new GenericForm(new OnTaxPayments()));
    mockSaveTaxPaymentsData.mockResolvedValue(undefined);
  });

  describe('on GET', () => {
    it('should render the tax payments page', async () => {
      await getHandler(req as Request, res as unknown as Response, next);

      expect(mockGetOnTaxPaymentsForm).toHaveBeenCalled();
      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({
        form: expect.anything(),
      }));
      expect(next).not.toHaveBeenCalled();
    });

    it('should call next when loading the claim fails', async () => {
      const error = new Error('draft failure');
      mockGetOnTaxPaymentsForm.mockRejectedValue(error);

      await getHandler(req as Request, res as unknown as Response, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('on POST', () => {
    it('should re-render when no option is selected', async () => {
      await postHandler(req as Request, res as unknown as Response, next);

      expect((res.render as jest.Mock).mock.calls[0][1].form.hasErrors()).toBe(true);
      expect(mockSaveTaxPaymentsData).not.toHaveBeenCalled();
    });

    it('should re-render when yes is selected without an amount or reason', async () => {
      req.body = {option: YesNo.YES, amountYouOwe: null, reason: undefined};

      await postHandler(req as Request, res as unknown as Response, next);

      expect((res.render as jest.Mock).mock.calls[0][1].form.hasErrors()).toBe(true);
      expect(res.redirect).not.toHaveBeenCalled();
    });

    it('should save and redirect when yes and the amount and reason are valid', async () => {
      req.body = validTaxPayment;

      await postHandler(req as Request, res as unknown as Response, next);

      expect(mockSaveTaxPaymentsData).toHaveBeenCalled();
      expect(res.redirect).toHaveBeenCalledWith(constructResponseUrlWithIdParams(claimId, CITIZEN_COURT_ORDERS_URL));
    });

    it('should save and redirect when no is selected', async () => {
      req.body = {option: YesNo.NO};

      await postHandler(req as Request, res as unknown as Response, next);

      expect(mockSaveTaxPaymentsData).toHaveBeenCalled();
      expect(res.redirect).toHaveBeenCalledWith(constructResponseUrlWithIdParams(claimId, CITIZEN_COURT_ORDERS_URL));
    });

    it('should call next when saving fails', async () => {
      const error = new Error('draft failure');
      mockSaveTaxPaymentsData.mockRejectedValue(error);
      req.body = validTaxPayment;

      await postHandler(req as Request, res as unknown as Response, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });
});
