import {Response} from 'express';
import repaymentPlanController from '../../../../../../../../main/routes/features/response/admission/partialAdmission/repaymentPlan/repaymentPlanController';
import {RESPONSE_TASK_LIST_URL} from 'routes/urls';
import {PartialAdmissionRepaymentPlanForm} from 'common/form/models/admission/partialAdmission/partialAdmissionRepaymentPlan';
import {getRepaymentPlanForm, saveRepaymentPlanData} from 'services/features/response/repaymentPlan/repaymentPlanService';
import {generateRedisKey, getCaseDataFromStore} from 'modules/draft-store/draftStoreService';
import {Claim} from 'models/claim';
import {ResponseType} from 'form/models/responseType';
import {AppRequest} from 'models/AppRequest';
import {GenericForm} from 'form/models/genericForm';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {getNextYearValue} from '../../../../../../../utils/dateUtils';
import {createMockResponse, createMockSession, getRouteHandler} from '../../../../../../../utils/getRouteHandler';

jest.mock('modules/draft-store/draftStoreService');
jest.mock('services/features/response/repaymentPlan/repaymentPlanService');

describe('Repayment Plan', () => {
  const getHandler = getRouteHandler(repaymentPlanController, 'get');
  const postHandler = getRouteHandler(repaymentPlanController, 'post');
  const viewPath = 'features/response/repaymentPlan/repaymentPlan';
  const claimId = '12345';
  const mockFutureYear = getNextYearValue();
  let req: Partial<AppRequest>;
  let res: ReturnType<typeof createMockResponse>;
  let next: jest.Mock;
  const mockGetCaseData = getCaseDataFromStore as jest.Mock;
  const mockGenerateRedisKey = generateRedisKey as jest.Mock;
  const mockGetRepaymentPlanForm = getRepaymentPlanForm as jest.Mock;
  const mockSaveRepaymentPlanData = saveRepaymentPlanData as jest.Mock;
  const renderedForm = () => (res.render as jest.Mock).mock.calls[0][1].form;

  const stubClaim = (amount = 1000): Claim => {
    const claim = new Claim();
    jest.spyOn(claim, 'partialAdmissionPaymentAmount').mockReturnValue(amount);
    return claim;
  };

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
    mockGetCaseData.mockResolvedValue(stubClaim());
    mockGetRepaymentPlanForm.mockResolvedValue(new PartialAdmissionRepaymentPlanForm(1000));
    mockSaveRepaymentPlanData.mockResolvedValue(undefined);
  });

  describe('on GET', () => {
    it('should render repayment plan page successfully', async () => {
      await getHandler(req as AppRequest, res as unknown as Response, next);

      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({
        form: expect.any(GenericForm),
        paymentExampleDate: expect.any(String),
        amount: 1000,
        admission: ResponseType.PART_ADMISSION,
      }));
    });

    it('should call next when loading the claim fails', async () => {
      const error = new Error('error');
      mockGetCaseData.mockRejectedValue(error);

      await getHandler(req as AppRequest, res as unknown as Response, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('on POST', () => {
    it('should return error when no input text is filled', async () => {
      await postHandler(req as AppRequest, res as unknown as Response, next);

      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({form: expect.any(GenericForm)}));
      expect(renderedForm().errorFor('repaymentFrequency')).toBe('ERRORS.PAYMENT_FREQUENCY_REQUIRED');
      expect(renderedForm().errorFor('paymentAmount')).toBe('ERRORS.AMOUNT_REQUIRED');
      expect(renderedForm().errorFor('year')).toBe('ERRORS.VALID_YEAR');
      expect(renderedForm().errorFor('month')).toBe('ERRORS.VALID_MONTH');
      expect(renderedForm().errorFor('day')).toBe('ERRORS.VALID_DAY');
    });

    it('should return errors when payment amount is defined and frequency, day, month, year are not defined', async () => {
      req.body = {paymentAmount: '1000', day: '', month: '', year: ''};

      await postHandler(req as AppRequest, res as unknown as Response, next);

      expect(renderedForm().errorFor('repaymentFrequency')).toBe('ERRORS.PAYMENT_FREQUENCY_REQUIRED');
      expect(renderedForm().errorFor('year')).toBe('ERRORS.VALID_YEAR');
      expect(renderedForm().errorFor('month')).toBe('ERRORS.VALID_MONTH');
      expect(renderedForm().errorFor('day')).toBe('ERRORS.VALID_DAY');
    });

    it('should return errors when payment amount and frequency are defined and day, month, year are not defined', async () => {
      req.body = {paymentAmount: '1000', repaymentFrequency: 'WEEK', day: '', month: '', year: ''};

      await postHandler(req as AppRequest, res as unknown as Response, next);

      expect(renderedForm().errorFor('year')).toBe('ERRORS.VALID_YEAR');
      expect(renderedForm().errorFor('month')).toBe('ERRORS.VALID_MONTH');
      expect(renderedForm().errorFor('day')).toBe('ERRORS.VALID_DAY');
    });

    it('should return errors when payment amount, frequency and day are defined and month, year are not defined', async () => {
      req.body = {paymentAmount: '1000', repaymentFrequency: 'WEEK', day: '1', month: '', year: ''};

      await postHandler(req as AppRequest, res as unknown as Response, next);

      expect(renderedForm().errorFor('year')).toBe('ERRORS.VALID_YEAR');
      expect(renderedForm().errorFor('month')).toBe('ERRORS.VALID_MONTH');
    });

    it('should return errors when payment amount, frequency, day and month are defined and year is not defined', async () => {
      req.body = {paymentAmount: '1000', repaymentFrequency: 'WEEK', day: '1', month: '11', year: ''};

      await postHandler(req as AppRequest, res as unknown as Response, next);

      expect(renderedForm().errorFor('year')).toBe('ERRORS.VALID_YEAR');
    });

    it('should return errors when payment amount, frequency, day, month and year is 0', async () => {
      req.body = {paymentAmount: '1000', repaymentFrequency: 'WEEK', day: '0', month: '0', year: '0'};

      await postHandler(req as AppRequest, res as unknown as Response, next);

      expect(renderedForm().errorFor('month')).toBe('ERRORS.VALID_MONTH');
      expect(renderedForm().errorFor('day')).toBe('ERRORS.VALID_DAY');
      expect(renderedForm().errorFor('year')).toBe('ERRORS.VALID_FOUR_DIGIT_YEAR');
    });

    it('should return errors when payment amount, frequency, day, month and year is in the past', async () => {
      req.body = {paymentAmount: '1000', repaymentFrequency: 'WEEK', day: '14', month: '02', year: '1973'};

      await postHandler(req as AppRequest, res as unknown as Response, next);

      expect(renderedForm().errorFor('firstRepaymentDate')).toBe('ERRORS.FIRST_PAYMENT_MESSAGE');
    });

    it('should return errors when payment amount is not defined', async () => {
      req.body = {paymentAmount: '', repaymentFrequency: 'WEEK', day: '14', month: '02', year: '2040'};

      await postHandler(req as AppRequest, res as unknown as Response, next);

      expect(renderedForm().errorFor('paymentAmount')).toBe('ERRORS.AMOUNT_REQUIRED');
    });

    it('should return errors when payment amount is -1', async () => {
      req.body = {paymentAmount: '-1', repaymentFrequency: 'WEEK', day: '14', month: '02', year: '2040'};

      await postHandler(req as AppRequest, res as unknown as Response, next);

      expect(renderedForm().errorFor('paymentAmount')).toBe('ERRORS.AMOUNT_REQUIRED');
    });

    it('should return errors when payment amount is greater than the total claim amount', async () => {
      req.body = {paymentAmount: '10000000000', repaymentFrequency: 'WEEK', day: '14', month: '02', year: '2040'};

      await postHandler(req as AppRequest, res as unknown as Response, next);

      expect(renderedForm().errorFor('paymentAmount')).toBe('ERRORS.EQUAL_INSTALMENTS_REQUIRED');
    });

    it('should return errors when payment amount has more than two decimal places', async () => {
      req.body = {paymentAmount: '99.333', repaymentFrequency: 'WEEK', day: '14', month: '02', year: '2040'};

      await postHandler(req as AppRequest, res as unknown as Response, next);

      expect(renderedForm().errorFor('paymentAmount')).toBe('ERRORS.VALID_TWO_DECIMAL_NUMBER');
    });

    it('should redirect with valid input', async () => {
      req.body = {paymentAmount: '100', repaymentFrequency: 'WEEK', day: '1', month: '08', year: String(mockFutureYear)};

      await postHandler(req as AppRequest, res as unknown as Response, next);

      expect(mockSaveRepaymentPlanData).toHaveBeenCalled();
      expect(res.redirect).toHaveBeenCalledWith(constructResponseUrlWithIdParams(claimId, RESPONSE_TASK_LIST_URL));
    });

    it('should redirect with valid input with two weeks frequency', async () => {
      req.body = {paymentAmount: '100', repaymentFrequency: 'TWO_WEEKS', day: '1', month: '08', year: String(mockFutureYear)};

      await postHandler(req as AppRequest, res as unknown as Response, next);

      expect(res.redirect).toHaveBeenCalledWith(constructResponseUrlWithIdParams(claimId, RESPONSE_TASK_LIST_URL));
    });

    it('should redirect with valid input with every month frequency', async () => {
      req.body = {paymentAmount: '100', repaymentFrequency: 'MONTH', day: '1', month: '08', year: String(mockFutureYear)};

      await postHandler(req as AppRequest, res as unknown as Response, next);

      expect(res.redirect).toHaveBeenCalledWith(constructResponseUrlWithIdParams(claimId, RESPONSE_TASK_LIST_URL));
    });

    it('should call next when loading the claim fails', async () => {
      const error = new Error('error');
      mockGetCaseData.mockRejectedValue(error);
      req.body = {jobTitle: 'Developer', annualTurnover: 70000};

      await postHandler(req as AppRequest, res as unknown as Response, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });
});
