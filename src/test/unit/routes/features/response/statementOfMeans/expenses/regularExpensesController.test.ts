import {Response} from 'express';
import regularExpensesController from '../../../../../../../main/routes/features/response/statementOfMeans/expenses/regularExpensesController';
import {CITIZEN_MONTHLY_INCOME_URL} from 'routes/urls';
import {AppRequest} from 'models/AppRequest';
import {GenericForm} from 'form/models/genericForm';
import {RegularExpenses} from 'form/models/statementOfMeans/expensesAndIncome/regularExpenses';
import {
  getRegularExpenses,
  saveRegularExpenses,
} from 'services/features/response/statementOfMeans/expenses/regularExpensesService';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {createMockResponse, createMockSession, getRouteHandler} from '../../../../../../utils/getRouteHandler';

jest.mock('services/features/response/statementOfMeans/expenses/regularExpensesService', () => ({
  getRegularExpenses: jest.fn(),
  saveRegularExpenses: jest.fn(),
}));

const expenseBody = (declared: string | string[], model: Record<string, unknown>) => ({declared, model});

describe('Regular Expenses Controller', () => {
  const getHandler = getRouteHandler(regularExpensesController, 'get');
  const postHandler = getRouteHandler(regularExpensesController, 'post');
  const viewPath = 'features/response/statementOfMeans/expenses/regular-expenses';
  const claimId = 'aaa';
  let req: Partial<AppRequest>;
  let res: ReturnType<typeof createMockResponse>;
  let next: jest.Mock;
  const mockGetRegularExpenses = getRegularExpenses as jest.Mock;
  const mockSaveRegularExpenses = saveRegularExpenses as jest.Mock;
  const renderedForm = () => (res.render as jest.Mock).mock.calls[0][1].form;
  const errorTexts = (): string[] => renderedForm().getAllErrors()
    .map((error: {text?: string}) => error.text)
    .filter(Boolean);

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
    mockGetRegularExpenses.mockResolvedValue(RegularExpenses.buildEmptyForm());
    mockSaveRegularExpenses.mockResolvedValue(undefined);
  });

  describe('on GET', () => {
    it('should display page successfully', async () => {
      await getHandler(req as AppRequest, res as unknown as Response, next);

      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({
        form: expect.any(GenericForm),
      }));
    });

    it('should call next when error thrown', async () => {
      const error = new Error('error');
      mockGetRegularExpenses.mockRejectedValue(error);

      await getHandler(req as AppRequest, res as unknown as Response, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('on POST', () => {
    const expectAmountAndScheduleErrors = async (declared: string, sourceName: string, amountKey: string, scheduleKey: string) => {
      req.body = expenseBody(declared, {
        [declared]: {transactionSource: {name: sourceName, amount: '', schedule: undefined}},
      });
      await postHandler(req as AppRequest, res as unknown as Response, next);
      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({form: expect.any(GenericForm)}));
      expect(errorTexts()).toEqual(expect.arrayContaining([amountKey, scheduleKey]));
    };

    it('should show errors when mortgage is selected but no amount or schedule selected', async () => {
      await expectAmountAndScheduleErrors('mortgage', 'mortgage', 'ERRORS.EXPENSES_AMOUNT.MORTGAGE', 'ERRORS.EXPENSES_FREQUENCY.MORTGAGE');
    });

    it('should show errors when mortgage and rent are selected but no amount or schedule selected', async () => {
      req.body = expenseBody(['mortgage', 'rent'], {
        mortgage: {transactionSource: {name: 'mortgage', amount: '', schedule: undefined}},
        rent: {transactionSource: {name: 'rent', amount: '', schedule: undefined}},
      });

      await postHandler(req as AppRequest, res as unknown as Response, next);

      expect(errorTexts()).toEqual(expect.arrayContaining([
        'ERRORS.EXPENSES_AMOUNT.MORTGAGE',
        'ERRORS.EXPENSES_FREQUENCY.MORTGAGE',
        'ERRORS.EXPENSES_AMOUNT.RENT',
        'ERRORS.EXPENSES_FREQUENCY.RENT',
      ]));
    });

    it('should show errors when councilTax is selected but no amount or schedule selected', async () => {
      await expectAmountAndScheduleErrors('councilTax', 'Council Tax', 'ERRORS.EXPENSES_AMOUNT.COUNCIL_TAX', 'ERRORS.EXPENSES_FREQUENCY.COUNCIL_TAX');
    });

    it('should show errors when gas is selected but no amount or schedule selected', async () => {
      req.body = expenseBody(['gas'], {
        gas: {transactionSource: {name: 'gas', amount: '', schedule: undefined}},
      });

      await postHandler(req as AppRequest, res as unknown as Response, next);

      expect(errorTexts()).toEqual(expect.arrayContaining([
        'ERRORS.EXPENSES_AMOUNT.GAS',
        'ERRORS.EXPENSES_FREQUENCY.GAS',
      ]));
    });

    it('should show errors when water is selected but no amount or schedule selected', async () => {
      req.body = expenseBody(['water'], {
        water: {transactionSource: {name: 'water', amount: '', schedule: undefined}},
      });

      await postHandler(req as AppRequest, res as unknown as Response, next);

      expect(errorTexts()).toEqual(expect.arrayContaining([
        'ERRORS.EXPENSES_AMOUNT.WATER',
        'ERRORS.EXPENSES_FREQUENCY.WATER',
      ]));
    });

    it('should show errors when electricity is selected but no amount or schedule selected', async () => {
      req.body = expenseBody(['electricity'], {
        electricity: {transactionSource: {name: 'electricity', amount: '', schedule: undefined}},
      });

      await postHandler(req as AppRequest, res as unknown as Response, next);

      expect(errorTexts()).toEqual(expect.arrayContaining([
        'ERRORS.EXPENSES_AMOUNT.ELECTRICITY',
        'ERRORS.EXPENSES_FREQUENCY.ELECTRICITY',
      ]));
    });

    it('should show errors when travel is selected but no amount or schedule selected', async () => {
      await expectAmountAndScheduleErrors('travel', 'travel', 'ERRORS.EXPENSES_AMOUNT.TRAVEL', 'ERRORS.EXPENSES_FREQUENCY.TRAVEL');
    });

    it('should show errors when school cost is selected but no amount or schedule selected', async () => {
      await expectAmountAndScheduleErrors('schoolCosts', 'school costs (include clothing)', 'ERRORS.EXPENSES_AMOUNT.SCHOOL_COSTS', 'ERRORS.EXPENSES_FREQUENCY.SCHOOL_COSTS');
    });

    it('should show errors when food and housekeeping is selected but no amount or schedule selected', async () => {
      await expectAmountAndScheduleErrors('foodAndHousekeeping', 'food and housekeeping', 'ERRORS.EXPENSES_AMOUNT.FOOD_HOUSEKEEPING', 'ERRORS.EXPENSES_FREQUENCY.FOOD_HOUSEKEEPING');
    });

    it('should show errors when tv and broadband is selected but no amount or schedule selected', async () => {
      await expectAmountAndScheduleErrors('tvAndBroadband', 'TV and broadband', 'ERRORS.EXPENSES_AMOUNT.TV_AND_BROADBAND', 'ERRORS.EXPENSES_FREQUENCY.TV_AND_BROADBAND');
    });

    it('should show errors when hire purchase is selected but no amount or schedule selected', async () => {
      await expectAmountAndScheduleErrors('hirePurchase', 'hire purchase', 'ERRORS.EXPENSES_AMOUNT.HIRE_PURCHASES', 'ERRORS.EXPENSES_FREQUENCY.HIRE_PURCHASES');
    });

    it('should show errors when mobile phone is selected but no amount or schedule selected', async () => {
      await expectAmountAndScheduleErrors('mobilePhone', 'mobile phone', 'ERRORS.EXPENSES_AMOUNT.MOBILE_PHONE', 'ERRORS.EXPENSES_FREQUENCY.MOBILE_PHONE');
    });

    it('should show errors when maintenance payments is selected but no amount or schedule selected', async () => {
      await expectAmountAndScheduleErrors('maintenance', 'maintenance payments', 'ERRORS.EXPENSES_AMOUNT.MAINTENANCE_PAYMENTS', 'ERRORS.EXPENSES_FREQUENCY.MAINTENANCE_PAYMENTS');
    });

    it('should show errors when other is selected but no amount or schedule selected', async () => {
      req.body = expenseBody('other', {
        other: {transactionSources: [{name: '', amount: '', schedule: undefined}]},
      });

      await postHandler(req as AppRequest, res as unknown as Response, next);

      expect(errorTexts()).toEqual(expect.arrayContaining([
        'ERRORS.EXPENSES_AMOUNT.OTHER',
        'ERRORS.EXPENSES_FREQUENCY.OTHER',
      ]));
    });

    it('should show errors when mortgage is selected but no schedule selected', async () => {
      req.body = expenseBody('mortgage', {
        mortgage: {transactionSource: {name: 'mortgage', amount: '123', schedule: undefined}},
      });

      await postHandler(req as AppRequest, res as unknown as Response, next);

      expect(errorTexts()).toContain('ERRORS.EXPENSES_FREQUENCY.MORTGAGE');
    });

    it('should show errors when mortgage is selected and amount is negative', async () => {
      req.body = expenseBody('mortgage', {
        mortgage: {transactionSource: {name: 'mortgage', amount: '-123', schedule: 'WEEK'}},
      });

      await postHandler(req as AppRequest, res as unknown as Response, next);

      expect(errorTexts()).toContain('ERRORS.EXPENSES_AMOUNT_FORMAT.MORTGAGE');
    });

    it('should show errors when mortgage is selected and amount has three decimal places', async () => {
      req.body = expenseBody('mortgage', {
        mortgage: {transactionSource: {name: 'mortgage', amount: '123.333', schedule: 'WEEK'}},
      });

      await postHandler(req as AppRequest, res as unknown as Response, next);

      expect(errorTexts()).toContain('ERRORS.EXPENSES_AMOUNT_FORMAT.MORTGAGE');
    });

    it('should show errors when other is selected and data for other is not correctly selected', async () => {
      req.body = expenseBody('other', {
        other: {
          transactionSources: [
            {name: undefined, amount: '123.33', schedule: 'WEEK'},
            {name: 'Dog groomers', amount: '123.33', schedule: undefined},
            {name: 'Livery', amount: '123.333', schedule: 'MONTH'},
          ],
        },
      });

      await postHandler(req as AppRequest, res as unknown as Response, next);

      expect(errorTexts()).toEqual(expect.arrayContaining([
        'ERRORS.EXPENSES_ENTER_OTHER_SOURCE',
        'ERRORS.EXPENSES_AMOUNT_FORMAT.OTHER',
        'ERRORS.EXPENSES_FREQUENCY.OTHER',
      ]));
    });

    it('should redirect when no data is selected', async () => {
      req.body = {};

      await postHandler(req as AppRequest, res as unknown as Response, next);

      expect(mockSaveRegularExpenses).toHaveBeenCalled();
      expect(res.redirect).toHaveBeenCalledWith(constructResponseUrlWithIdParams(claimId, CITIZEN_MONTHLY_INCOME_URL));
    });

    it('should redirect when correct data is selected', async () => {
      req.body = expenseBody('mortgage', {
        mortgage: {transactionSource: {name: 'mortgage', amount: '123.33', schedule: 'WEEK'}},
      });

      await postHandler(req as AppRequest, res as unknown as Response, next);

      expect(res.redirect).toHaveBeenCalledWith(constructResponseUrlWithIdParams(claimId, CITIZEN_MONTHLY_INCOME_URL));
    });

    it('should redirect when correct data for other expenses', async () => {
      req.body = expenseBody('other', {
        other: {
          transactionSources: [
            {name: 'other things', amount: '123.33', schedule: 'WEEK'},
            {name: 'and some more other things', amount: '123.33', schedule: 'MONTH'},
          ],
        },
      });

      await postHandler(req as AppRequest, res as unknown as Response, next);

      expect(res.redirect).toHaveBeenCalledWith(constructResponseUrlWithIdParams(claimId, CITIZEN_MONTHLY_INCOME_URL));
    });

    it('should call next when save throws', async () => {
      const error = new Error('error');
      mockSaveRegularExpenses.mockRejectedValue(error);
      req.body = {};

      await postHandler(req as AppRequest, res as unknown as Response, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });
});
