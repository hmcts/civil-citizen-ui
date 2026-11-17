import {Response} from 'express';
import repaymentPlanInstalmentsController from 'routes/features/claimantResponse/ccj/repaymentPlanInstalmentsController';
import {CCJ_CHECK_AND_SEND_URL, CCJ_REPAYMENT_PLAN_INSTALMENTS_URL} from 'routes/urls';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {saveClaimantResponse} from 'services/features/claimantResponse/claimantResponseService';
import {generateRedisKey, getCaseDataFromStore} from 'modules/draft-store/draftStoreService';
import {Claim} from 'models/claim';
import {TransactionSchedule} from 'form/models/statementOfMeans/expensesAndIncome/transactionSchedule';
import {AppRequest} from 'models/AppRequest';
import {createMockResponse, createMockSession, getRouteHandler} from '../../../../../utils/getRouteHandler';

jest.mock('services/features/claimantResponse/claimantResponseService');
jest.mock('modules/draft-store/draftStoreService');

const viewPath = 'features/claimantResponse/ccj/repayment-plan-instalments';
const claimId = '12345';
const checkAnswersUrl = constructResponseUrlWithIdParams(claimId, CCJ_CHECK_AND_SEND_URL);
const futureDate = {day: '10', month: '12', year: '2060'};

const claimWithAmount = (totalClaimAmount?: number): Claim => {
  const claim = new Claim();
  claim.totalClaimAmount = totalClaimAmount;
  return claim;
};

const invoke = async (method: 'get' | 'post', req: Record<string, unknown> = {}) => {
  const res = createMockResponse();
  const next = jest.fn();
  await getRouteHandler(repaymentPlanInstalmentsController, method, CCJ_REPAYMENT_PLAN_INSTALMENTS_URL)(
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
    pageTitle: 'PAGES.CCJ_REPAYMENT_PLAN_INSTALMENTS.PAGE_TITLE',
  }));
  expect(res.render.mock.calls[0][1].form.hasErrors()).toBe(true);
  expect(res.redirect).not.toHaveBeenCalled();
};

const validBody = (overrides: Record<string, unknown> = {}) => ({
  amount: '100.50',
  firstPaymentDate: futureDate,
  paymentFrequency: TransactionSchedule.WEEK,
  ...overrides,
});

describe('CCJ Repayment Plan page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (generateRedisKey as jest.Mock).mockReturnValue(claimId);
    (getCaseDataFromStore as jest.Mock).mockResolvedValue(claimWithAmount(5000));
    (saveClaimantResponse as jest.Mock).mockResolvedValue(undefined);
  });

  describe('on GET', () => {
    it('should return CCJ Repayment Plan page empty when dont have information on redis', async () => {
      (getCaseDataFromStore as jest.Mock).mockResolvedValue(new Claim());

      const {res} = await invoke('get');

      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({
        pageTitle: 'PAGES.CCJ_REPAYMENT_PLAN_INSTALMENTS.PAGE_TITLE',
      }));
    });

    it('should return http 500 when has error in the get method', async () => {
      const error = new Error('redis failure');
      (getCaseDataFromStore as jest.Mock).mockRejectedValue(error);

      const {next} = await invoke('get');

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('on POST', () => {
    it('should create a new claim response if redis gives undefined', async () => {
      (getCaseDataFromStore as jest.Mock).mockResolvedValue(new Claim());

      const {res} = await invoke('post', {body: validBody({amount: '1000'})});

      expect(saveClaimantResponse).toHaveBeenCalled();
      expect(res.redirect).toHaveBeenCalledWith(checkAnswersUrl);
    });

    describe('instalmentAmount', () => {
      it('should return error when no amount input', async () => {
        const {res} = await invoke('post', {body: validBody({amount: ''})});

        expectErrors(res);
      });

      it('should return error when negative amount input', async () => {
        const {res} = await invoke('post', {body: validBody({amount: '-10'})});

        expectErrors(res);
      });

      it('should return error when amount is more than two decimal places', async () => {
        const {res} = await invoke('post', {body: validBody({amount: '100.123'})});

        expectErrors(res);
      });

      it('should return error when amount is more than total claim amount', async () => {
        (getCaseDataFromStore as jest.Mock).mockResolvedValue(claimWithAmount(1000));

        const {res} = await invoke('post', {body: validBody({amount: '5000'})});

        expectErrors(res);
      });
    });

    describe('firstPaymentDate', () => {
      it('should return error for day larger than 31', async () => {
        const {res} = await invoke('post', {body: validBody({firstPaymentDate: {day: '32', month: '12', year: '2060'}})});

        expectErrors(res);
      });

      it('should return error for day when no input', async () => {
        const {res} = await invoke('post', {body: validBody({firstPaymentDate: {day: '', month: '12', year: '2060'}})});

        expectErrors(res);
      });

      it('should return error for month larger than 12', async () => {
        const {res} = await invoke('post', {body: validBody({firstPaymentDate: {day: '30', month: '13', year: '2060'}})});

        expectErrors(res);
      });

      it('should return error for month when no input', async () => {
        const {res} = await invoke('post', {body: validBody({firstPaymentDate: {day: '31', month: '', year: '2060'}})});

        expectErrors(res);
      });

      it('should return error for year not 4 digits', async () => {
        const {res} = await invoke('post', {body: validBody({firstPaymentDate: {day: '10', month: '10', year: '999'}})});

        expectErrors(res);
      });

      it('should return error for year when no input', async () => {
        const {res} = await invoke('post', {body: validBody({firstPaymentDate: {day: '10', month: '12', year: ''}})});

        expectErrors(res);
      });

      it('should return error when year is larger than 9999', async () => {
        const {res} = await invoke('post', {body: validBody({firstPaymentDate: {day: '10', month: '12', year: '10000'}})});

        expectErrors(res);
      });

      it('should return error for date that is before a month from now', async () => {
        const {res} = await invoke('post', {body: validBody({firstPaymentDate: {day: '10', month: '12', year: '2010'}})});

        expectErrors(res);
      });
    });

    describe('paymentFrequency', () => {
      it('should return error when no payment frequency option selected', async () => {
        const {res} = await invoke('post', {body: validBody({paymentFrequency: undefined})});

        expectErrors(res);
      });
    });

    describe('valid inputs', () => {
      it('should redirect check your answers page on valid inputs (paymentFrequency: WEEK)', async () => {
        const {res} = await invoke('post', {body: validBody({paymentFrequency: TransactionSchedule.WEEK})});

        expect(res.redirect).toHaveBeenCalledWith(checkAnswersUrl);
      });

      it('should redirect check your answers page on valid inputs (paymentFrequency: 2 WEEKS)', async () => {
        const {res} = await invoke('post', {body: validBody({paymentFrequency: TransactionSchedule.TWO_WEEKS})});

        expect(res.redirect).toHaveBeenCalledWith(checkAnswersUrl);
      });

      it('should redirect check your answers page on valid inputs (paymentFrequency: MONTH)', async () => {
        const {res} = await invoke('post', {body: validBody({paymentFrequency: TransactionSchedule.MONTH})});

        expect(res.redirect).toHaveBeenCalledWith(checkAnswersUrl);
      });
    });

    it('should return http 500 when has error in the post method', async () => {
      const error = new Error('redis failure');
      (getCaseDataFromStore as jest.Mock).mockRejectedValue(error);

      const {next} = await invoke('post', {body: validBody()});

      expect(next).toHaveBeenCalledWith(error);
    });
  });
});
