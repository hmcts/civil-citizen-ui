import {Response} from 'express';
import claimantSuggestedInstalmentsController from 'routes/features/claimantResponse/claimantSuggestedInstalmentsController';
import {CLAIMANT_RESPONSE_COURT_OFFERED_INSTALMENTS_URL, CLAIMANT_RESPONSE_PAYMENT_PLAN_URL} from 'routes/urls';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {getFinancialDetails, saveClaimantResponse} from 'services/features/claimantResponse/claimantResponseService';
import {getDecisionOnClaimantProposedPlan} from 'services/features/claimantResponse/getDecisionOnClaimantProposedPlan';
import {generateRedisKey, getCaseDataFromStore} from 'modules/draft-store/draftStoreService';
import {getClaimById} from 'modules/utilityService';
import {Claim} from 'models/claim';
import {TransactionSchedule} from 'form/models/statementOfMeans/expensesAndIncome/transactionSchedule';
import {AppRequest} from 'models/AppRequest';
import {createMockResponse, createMockSession, getRouteHandler} from '../../../../utils/getRouteHandler';

jest.mock('services/features/claimantResponse/claimantResponseService', () => ({
  getFinancialDetails: jest.fn((): unknown[] => []),
  saveClaimantResponse: jest.fn(),
}));
jest.mock('services/features/claimantResponse/getDecisionOnClaimantProposedPlan');
jest.mock('modules/draft-store/draftStoreService');
jest.mock('modules/utilityService', () => ({
  getClaimById: jest.fn(),
}));

const viewPath = 'features/claimantResponse/instalments-plan';
const claimId = '12345';
const futureYear = String(new Date().getFullYear() + 2);

const amountClaim = (): Claim => {
  const claim = new Claim();
  claim.totalClaimAmount = 1000;
  return claim;
};

const invoke = async (method: 'get' | 'post', req: Record<string, unknown> = {}) => {
  const res = createMockResponse();
  const next = jest.fn();
  await getRouteHandler(claimantSuggestedInstalmentsController, method, CLAIMANT_RESPONSE_PAYMENT_PLAN_URL)(
    {
      params: {id: claimId},
      body: {},
      query: {},
      cookies: {},
      session: createMockSession({user: {id: 'user-1'}}),
      ...req,
    } as unknown as AppRequest,
    res as unknown as Response,
    next,
  );
  return {res, next};
};

const expectErrors = (res: ReturnType<typeof createMockResponse>) => {
  expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({
    pageTitle: 'PAGES.CCJ_REPAYMENT_PLAN_INSTALMENTS.TITLE',
  }));
  expect(res.render.mock.calls[0][1].form.hasErrors()).toBe(true);
  expect(res.redirect).not.toHaveBeenCalled();
};

describe('Suggest instalments for the defendant', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (generateRedisKey as jest.Mock).mockReturnValue(claimId);
    (getCaseDataFromStore as jest.Mock).mockResolvedValue(amountClaim());
    (getClaimById as jest.Mock).mockResolvedValue(amountClaim());
    (saveClaimantResponse as jest.Mock).mockResolvedValue(undefined);
    (getFinancialDetails as jest.Mock).mockReturnValue([]);
    (getDecisionOnClaimantProposedPlan as jest.Mock).mockResolvedValue(CLAIMANT_RESPONSE_COURT_OFFERED_INSTALMENTS_URL);
  });

  describe('on Get', () => {
    it('should return suggest instalments page successfully', async () => {
      const {res} = await invoke('get');

      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({
        pageTitle: 'PAGES.CCJ_REPAYMENT_PLAN_INSTALMENTS.TITLE',
        financialDetails: [],
      }));
    });

    it('should return 500 status code when error occurs', async () => {
      const error = new Error('redis failure');
      (getCaseDataFromStore as jest.Mock).mockRejectedValue(error);

      const {next} = await invoke('get');

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('on Post', () => {
    it('should return error when no input text is filled', async () => {
      const {res} = await invoke('post', {body: {}});

      expectErrors(res);
    });

    it('should return errors when payment amount is defined, but frequency, day, month and year are not defined', async () => {
      const {res} = await invoke('post', {body: {paymentAmount: '1000', day: '', month: '', year: ''}});

      expectErrors(res);
    });

    it('should return errors when payment amount and frequency are defined, but day, month and year are not defined', async () => {
      const {res} = await invoke('post', {body: {paymentAmount: '1000', repaymentFrequency: 'WEEK', day: '', month: '', year: ''}});

      expectErrors(res);
    });

    it('should return errors when payment amount, frequency and day are defined, but month, year are not defined', async () => {
      const {res} = await invoke('post', {body: {paymentAmount: '1000', repaymentFrequency: 'WEEK', day: '1', month: '', year: ''}});

      expectErrors(res);
    });

    it('should return errors when payment amount, frequency, day and month are defined, but year is not defined', async () => {
      const {res} = await invoke('post', {body: {paymentAmount: '1000', repaymentFrequency: 'WEEK', day: '1', month: '11', year: ''}});

      expectErrors(res);
    });

    it('should return errors when payment amount, frequency, day, month, but year is 0', async () => {
      const {res} = await invoke('post', {body: {paymentAmount: '1000', repaymentFrequency: 'WEEK', day: '0', month: '0', year: '0'}});

      expectErrors(res);
    });

    it('should return errors when payment amount, frequency, day, month and year provided but date is in the past', async () => {
      const {res} = await invoke('post', {body: {paymentAmount: '1000', repaymentFrequency: 'WEEK', day: '14', month: '02', year: '1973'}});

      expectErrors(res);
    });

    it('should return errors when payment amount is not defined', async () => {
      const {res} = await invoke('post', {body: {paymentAmount: '', repaymentFrequency: 'WEEK', day: '14', month: '02', year: futureYear}});

      expectErrors(res);
    });

    it('should return errors when payment amount is -1', async () => {
      const {res} = await invoke('post', {body: {paymentAmount: '-1', repaymentFrequency: 'WEEK', day: '14', month: '02', year: futureYear}});

      expectErrors(res);
    });

    it('should return errors when payment amount is not less equal than the total amount claim', async () => {
      const {res} = await invoke('post', {body: {paymentAmount: '10000000000', repaymentFrequency: 'WEEK', day: '14', month: '02', year: futureYear}});

      expectErrors(res);
    });

    it('should return errors when payment amount has more than two decimal places', async () => {
      const {res} = await invoke('post', {body: {paymentAmount: '99.333', repaymentFrequency: 'WEEK', day: '14', month: '02', year: futureYear}});

      expectErrors(res);
    });

    it('should redirect with valid input', async () => {
      const {res} = await invoke('post', {body: {paymentAmount: '100', repaymentFrequency: TransactionSchedule.WEEK, day: '1', month: '08', year: futureYear}});

      expect(res.redirect).toHaveBeenCalledWith(constructResponseUrlWithIdParams(claimId, CLAIMANT_RESPONSE_COURT_OFFERED_INSTALMENTS_URL));
    });

    it('should redirect with valid input with two weeks frequency', async () => {
      const {res} = await invoke('post', {body: {paymentAmount: '100', repaymentFrequency: TransactionSchedule.TWO_WEEKS, day: '1', month: '08', year: futureYear}});

      expect(res.redirect).toHaveBeenCalledWith(constructResponseUrlWithIdParams(claimId, CLAIMANT_RESPONSE_COURT_OFFERED_INSTALMENTS_URL));
    });

    it('should redirect with valid input with every month frequency', async () => {
      const {res} = await invoke('post', {body: {paymentAmount: '100', repaymentFrequency: TransactionSchedule.MONTH, day: '1', month: '08', year: futureYear}});

      expect(res.redirect).toHaveBeenCalledWith(constructResponseUrlWithIdParams(claimId, CLAIMANT_RESPONSE_COURT_OFFERED_INSTALMENTS_URL));
    });

    it('should return status 500 when there is error', async () => {
      const error = new Error('redis failure');
      (getCaseDataFromStore as jest.Mock).mockRejectedValue(error);

      const {next} = await invoke('post', {body: {paymentAmount: '100', repaymentFrequency: TransactionSchedule.WEEK, day: '1', month: '08', year: futureYear}});

      expect(next).toHaveBeenCalledWith(error);
    });
  });
});
