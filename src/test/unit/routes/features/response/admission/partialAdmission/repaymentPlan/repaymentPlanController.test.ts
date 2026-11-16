import {Request, Response} from 'express';
import repaymentPlanController from '../../../../../../../../main/routes/features/response/admission/partialAdmission/repaymentPlan/repaymentPlanController';
import {RESPONSE_TASK_LIST_URL} from 'routes/urls';
import {ResponseType} from 'form/models/responseType';
import * as draftStoreService from 'modules/draft-store/draftStoreService';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {Claim} from 'models/claim';
import {Party} from 'models/party';
import {PartialAdmission} from 'models/partialAdmission';
import {HowMuchDoYouOwe} from 'form/models/admission/partialAdmission/howMuchDoYouOwe';
import {PaymentIntention} from 'form/models/admission/paymentIntention';
import {getNextYearValue} from '../../../../../../../utils/dateUtils';
import {createMockResponse, getRouteHandler} from '../../../../../../../utils/getRouteHandler';

jest.mock('modules/draft-store/draftStoreService');

describe('Repayment Plan', () => {
  const getHandler = getRouteHandler(repaymentPlanController, 'get');
  const postHandler = getRouteHandler(repaymentPlanController, 'post');
  const viewPath = 'features/response/repaymentPlan/repaymentPlan';
  const claimId = '12345';
  const admittedAmount = 500;
  const mockFutureYear = getNextYearValue();
  let req: Partial<Request>;
  let res: ReturnType<typeof createMockResponse>;
  let next: jest.Mock;
  const mockGetCaseData = draftStoreService.getCaseDataFromStore as jest.Mock;
  const mockGenerateRedisKey = draftStoreService.generateRedisKey as jest.Mock;
  const mockSaveDraftClaim = draftStoreService.saveDraftClaim as jest.Mock;

  const stubClaim = (): Claim => {
    const claim = new Claim();
    claim.applicant1 = new Party();
    claim.respondent1 = new Party();
    claim.respondent1.responseType = ResponseType.PART_ADMISSION;
    claim.totalClaimAmount = 110;
    claim.partialAdmission = new PartialAdmission();
    claim.partialAdmission.howMuchDoYouOwe = new HowMuchDoYouOwe(admittedAmount);
    claim.partialAdmission.paymentIntention = new PaymentIntention();
    return claim;
  };

  const expectValidationError = () => {
    expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({
      form: expect.anything(),
      admission: ResponseType.PART_ADMISSION,
    }));
    expect((res.render as jest.Mock).mock.calls[0][1].form.hasErrors()).toBe(true);
    expect(res.redirect).not.toHaveBeenCalled();
  };

  beforeEach(() => {
    req = {params: {id: claimId}, body: {}, query: {}, cookies: {}};
    res = createMockResponse();
    next = jest.fn();
    jest.clearAllMocks();
    mockGenerateRedisKey.mockReturnValue(claimId);
    mockGetCaseData.mockResolvedValue(stubClaim());
    mockSaveDraftClaim.mockResolvedValue(undefined);
  });

  describe('on GET', () => {
    it('should render the repayment plan page', async () => {
      await getHandler(req as Request, res as unknown as Response, next);

      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({
        form: expect.anything(),
        amount: admittedAmount,
        admission: ResponseType.PART_ADMISSION,
      }));
      expect(next).not.toHaveBeenCalled();
    });

    it('should call next when loading the claim fails', async () => {
      const error = new Error('redis failure');
      mockGetCaseData.mockRejectedValue(error);

      await getHandler(req as Request, res as unknown as Response, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('on POST', () => {
    it('should re-render when no input is provided', async () => {
      await postHandler(req as Request, res as unknown as Response, next);

      expectValidationError();
    });

    it('should re-render when only the payment amount is provided', async () => {
      req.body = {paymentAmount: '1000', day: '', month: '', year: ''};

      await postHandler(req as Request, res as unknown as Response, next);

      expectValidationError();
    });

    it('should re-render when the payment amount and frequency are provided without a date', async () => {
      req.body = {paymentAmount: '1000', repaymentFrequency: 'WEEK', day: '', month: '', year: ''};

      await postHandler(req as Request, res as unknown as Response, next);

      expectValidationError();
    });

    it('should re-render when the month and year are missing', async () => {
      req.body = {paymentAmount: '1000', repaymentFrequency: 'WEEK', day: '1', month: '', year: ''};

      await postHandler(req as Request, res as unknown as Response, next);

      expectValidationError();
    });

    it('should re-render when the year is missing', async () => {
      req.body = {paymentAmount: '1000', repaymentFrequency: 'WEEK', day: '1', month: '11', year: ''};

      await postHandler(req as Request, res as unknown as Response, next);

      expectValidationError();
    });

    it('should re-render when the day, month and year are 0', async () => {
      req.body = {paymentAmount: '1000', repaymentFrequency: 'WEEK', day: '0', month: '0', year: '0'};

      await postHandler(req as Request, res as unknown as Response, next);

      expectValidationError();
    });

    it('should re-render when the first payment date is in the past', async () => {
      req.body = {paymentAmount: '1000', repaymentFrequency: 'WEEK', day: '14', month: '02', year: '1973'};

      await postHandler(req as Request, res as unknown as Response, next);

      expectValidationError();
    });

    it('should re-render when the payment amount is empty', async () => {
      req.body = {paymentAmount: '', repaymentFrequency: 'WEEK', day: '14', month: '02', year: '2040'};

      await postHandler(req as Request, res as unknown as Response, next);

      expectValidationError();
    });

    it('should re-render when the payment amount is negative', async () => {
      req.body = {paymentAmount: '-1', repaymentFrequency: 'WEEK', day: '14', month: '02', year: '2040'};

      await postHandler(req as Request, res as unknown as Response, next);

      expectValidationError();
    });

    it('should re-render when the instalment is not less than the admitted amount', async () => {
      req.body = {paymentAmount: '10000000000', repaymentFrequency: 'WEEK', day: '14', month: '02', year: '2040'};

      await postHandler(req as Request, res as unknown as Response, next);

      expectValidationError();
    });

    it('should re-render when the payment amount has more than two decimal places', async () => {
      req.body = {paymentAmount: '99.333', repaymentFrequency: 'WEEK', day: '14', month: '02', year: '2040'};

      await postHandler(req as Request, res as unknown as Response, next);

      expectValidationError();
    });

    it('should save and redirect to the task list for a weekly plan', async () => {
      req.body = {paymentAmount: '100', repaymentFrequency: 'WEEK', day: '1', month: '08', year: mockFutureYear};

      await postHandler(req as Request, res as unknown as Response, next);

      expect(mockSaveDraftClaim).toHaveBeenCalled();
      expect(res.redirect).toHaveBeenCalledWith(constructResponseUrlWithIdParams(claimId, RESPONSE_TASK_LIST_URL));
      expect(next).not.toHaveBeenCalled();
    });

    it('should save and redirect to the task list for a two-week plan', async () => {
      req.body = {paymentAmount: '100', repaymentFrequency: 'TWO_WEEKS', day: '1', month: '08', year: mockFutureYear};

      await postHandler(req as Request, res as unknown as Response, next);

      expect(res.redirect).toHaveBeenCalledWith(constructResponseUrlWithIdParams(claimId, RESPONSE_TASK_LIST_URL));
      expect(next).not.toHaveBeenCalled();
    });

    it('should save and redirect to the task list for a monthly plan', async () => {
      req.body = {paymentAmount: '100', repaymentFrequency: 'MONTH', day: '1', month: '08', year: mockFutureYear};

      await postHandler(req as Request, res as unknown as Response, next);

      expect(res.redirect).toHaveBeenCalledWith(constructResponseUrlWithIdParams(claimId, RESPONSE_TASK_LIST_URL));
      expect(next).not.toHaveBeenCalled();
    });

    it('should call next when loading the claim fails', async () => {
      const error = new Error('redis failure');
      mockGetCaseData.mockRejectedValue(error);
      req.body = {paymentAmount: '100', repaymentFrequency: 'WEEK', day: '1', month: '08', year: mockFutureYear};

      await postHandler(req as Request, res as unknown as Response, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });
});
