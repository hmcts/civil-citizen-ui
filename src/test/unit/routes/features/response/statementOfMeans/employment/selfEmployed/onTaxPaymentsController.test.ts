import {Response} from 'express';
import onTaxPaymentsController from '../../../../../../../../main/routes/features/response/statementOfMeans/employment/selfEmployed/onTaxPaymentsController';
import {CITIZEN_COURT_ORDERS_URL} from 'routes/urls';
import {AppRequest} from 'models/AppRequest';
import {GenericForm} from 'form/models/genericForm';
import {OnTaxPayments} from 'form/models/statementOfMeans/employment/selfEmployed/onTaxPayments';
import {YesNo} from 'form/models/yesNo';
import {
  getOnTaxPaymentsForm,
  saveTaxPaymentsData,
} from 'services/features/response/statementOfMeans/employment/selfEmployed/onTaxPaymentsService';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {createMockResponse, createMockSession, getRouteHandler} from '../../../../../../../utils/getRouteHandler';

jest.mock('services/features/response/statementOfMeans/employment/selfEmployed/onTaxPaymentsService', () => ({
  getOnTaxPaymentsForm: jest.fn(),
  saveTaxPaymentsData: jest.fn(),
}));

describe('on tax payments', () => {
  const getHandler = getRouteHandler(onTaxPaymentsController, 'get');
  const postHandler = getRouteHandler(onTaxPaymentsController, 'post');
  const viewPath = 'features/response/statementOfMeans/employment/selfEmployed/on-tax-payments';
  const claimId = 'aaa';
  let req: Partial<AppRequest>;
  let res: ReturnType<typeof createMockResponse>;
  let next: jest.Mock;
  const mockGetOnTaxPaymentsForm = getOnTaxPaymentsForm as jest.Mock;
  const mockSaveTaxPaymentsData = saveTaxPaymentsData as jest.Mock;
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
    mockGetOnTaxPaymentsForm.mockResolvedValue(new GenericForm(new OnTaxPayments()));
    mockSaveTaxPaymentsData.mockResolvedValue(undefined);
  });

  describe('on GET', () => {
    it('should render on tax payment page successfully', async () => {
      await getHandler(req as AppRequest, res as unknown as Response, next);

      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({
        form: expect.any(GenericForm),
      }));
    });

    it('should call next when error thrown', async () => {
      const error = new Error('error');
      mockGetOnTaxPaymentsForm.mockRejectedValue(error);

      await getHandler(req as AppRequest, res as unknown as Response, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('on POST', () => {
    it('should re-render when no option is selected', async () => {
      req.body = {};

      await postHandler(req as AppRequest, res as unknown as Response, next);

      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({form: expect.any(GenericForm)}));
      expect(renderedForm().errorFor('option')).toBe('ERRORS.VALID_YES_NO_SELECTION');
    });

    it('should re-render when option yes is selected and amount and reason are not defined', async () => {
      req.body = {option: YesNo.YES, amountYouOwe: null, reason: undefined};

      await postHandler(req as AppRequest, res as unknown as Response, next);

      expect(renderedForm().errorFor('amountYouOwe')).toBe('ERRORS.VALID_OWED_AMOUNT_REQUIRED');
      expect(renderedForm().errorFor('reason')).toBe('ERRORS.VALID_REASON_REQUIRED');
    });

    it('should re-render when option yes is selected and amount is 0', async () => {
      req.body = {option: YesNo.YES, amountYouOwe: 0, reason: 'reason'};

      await postHandler(req as AppRequest, res as unknown as Response, next);

      expect(renderedForm().errorFor('amountYouOwe')).toBe('ERRORS.VALID_OWED_AMOUNT_REQUIRED');
    });

    it('should re-render when option yes is selected and amount is -1', async () => {
      req.body = {option: YesNo.YES, amountYouOwe: -1, reason: 'reason'};

      await postHandler(req as AppRequest, res as unknown as Response, next);

      expect(renderedForm().errorFor('amountYouOwe')).toBe('ERRORS.VALID_OWED_AMOUNT_REQUIRED');
    });

    it('should re-render when option yes is selected and amount is abc', async () => {
      req.body = {option: YesNo.YES, amountYouOwe: 'abc', reason: 'reason'};

      await postHandler(req as AppRequest, res as unknown as Response, next);

      expect(renderedForm().errorFor('amountYouOwe')).toBe('ERRORS.VALID_TWO_DECIMAL_NUMBER');
    });

    it('should re-render when option yes is selected and amount has more than two decimal places', async () => {
      req.body = {option: YesNo.YES, amountYouOwe: 44.4444, reason: 'reason'};

      await postHandler(req as AppRequest, res as unknown as Response, next);

      expect(renderedForm().errorFor('amountYouOwe')).toBe('ERRORS.VALID_TWO_DECIMAL_NUMBER');
    });

    it('should re-render when option yes is selected and reason is not selected', async () => {
      req.body = {option: YesNo.YES, amountYouOwe: 44.44, reason: ''};

      await postHandler(req as AppRequest, res as unknown as Response, next);

      expect(renderedForm().errorFor('reason')).toBe('ERRORS.VALID_REASON_REQUIRED');
    });

    it('should redirect with valid input', async () => {
      req.body = {option: YesNo.YES, amountYouOwe: 44.4, reason: 'reason'};

      await postHandler(req as AppRequest, res as unknown as Response, next);

      expect(mockSaveTaxPaymentsData).toHaveBeenCalled();
      expect(res.redirect).toHaveBeenCalledWith(constructResponseUrlWithIdParams(claimId, CITIZEN_COURT_ORDERS_URL));
    });

    it('should call next when save throws', async () => {
      const error = new Error('error');
      mockSaveTaxPaymentsData.mockRejectedValue(error);
      req.body = {option: YesNo.YES, amountYouOwe: 44.4, reason: 'reason'};

      await postHandler(req as AppRequest, res as unknown as Response, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });
});
