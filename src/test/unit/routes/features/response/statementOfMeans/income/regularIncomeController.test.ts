import {Response} from 'express';
import regularIncomeController from '../../../../../../../main/routes/features/response/statementOfMeans/income/regularIncomeController';
import {CITIZEN_EXPLANATION_URL} from 'routes/urls';
import {AppRequest} from 'models/AppRequest';
import {GenericForm} from 'form/models/genericForm';
import {RegularIncome} from 'form/models/statementOfMeans/expensesAndIncome/regularIncome';
import {
  getRegularIncome,
  saveRegularIncome,
} from 'services/features/response/statementOfMeans/income/regularIncomeService';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {createMockResponse, createMockSession, getRouteHandler} from '../../../../../../utils/getRouteHandler';

jest.mock('services/features/response/statementOfMeans/income/regularIncomeService', () => ({
  getRegularIncome: jest.fn(),
  saveRegularIncome: jest.fn(),
}));

const jobIncomeBody = (name: string, amount: string, schedule?: string) => ({
  declared: 'job',
  model: {
    job: {
      transactionSource: {name, amount, schedule},
    },
  },
});

describe('Regular Income Controller', () => {
  const getHandler = getRouteHandler(regularIncomeController, 'get');
  const postHandler = getRouteHandler(regularIncomeController, 'post');
  const viewPath = 'features/response/statementOfMeans/income/regular-income';
  const claimId = 'aaa';
  let req: Partial<AppRequest>;
  let res: ReturnType<typeof createMockResponse>;
  let next: jest.Mock;
  const mockGetRegularIncome = getRegularIncome as jest.Mock;
  const mockSaveRegularIncome = saveRegularIncome as jest.Mock;
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
    mockGetRegularIncome.mockResolvedValue(RegularIncome.buildEmptyForm());
    mockSaveRegularIncome.mockResolvedValue(undefined);
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
      mockGetRegularIncome.mockRejectedValue(error);

      await getHandler(req as AppRequest, res as unknown as Response, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('on POST', () => {
    const expectAmountAndScheduleErrors = async (name: string, amountKey: string, scheduleKey: string) => {
      req.body = jobIncomeBody(name, '', undefined);
      await postHandler(req as AppRequest, res as unknown as Response, next);
      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({form: expect.any(GenericForm)}));
      expect(errorTexts()).toEqual(expect.arrayContaining([amountKey, scheduleKey]));
    };

    const expectAmountFormatError = async (name: string, amountKey: string) => {
      req.body = jobIncomeBody(name, '40.666', 'WEEK');
      await postHandler(req as AppRequest, res as unknown as Response, next);
      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({form: expect.any(GenericForm)}));
      expect(errorTexts()).toContain(amountKey);
    };

    it('should display errors when job is selected but no amount or schedule are specified', async () => {
      await expectAmountAndScheduleErrors(
        'Income from your job',
        'ERRORS.TRANSACTION_SOURCE.HOW_MUCH_INCOME.INCOME_JOB',
        'ERRORS.TRANSACTION_SOURCE.HOW_OFTEN_RECEIVE.INCOME_JOB',
      );
    });

    it('should display errors when universal credit is selected but no amount or schedule are specified', async () => {
      await expectAmountAndScheduleErrors(
        'Universal Credit',
        'ERRORS.TRANSACTION_SOURCE.HOW_MUCH_INCOME.UNIVERSAL_CREDIT',
        'ERRORS.TRANSACTION_SOURCE.HOW_OFTEN_RECEIVE.UNIVERSAL_CREDIT',
      );
    });

    it('should display errors when Jobseeker income based is selected but no amount or schedule are specified', async () => {
      await expectAmountAndScheduleErrors(
        'Jobseeker’s Allowance (income based)',
        'ERRORS.TRANSACTION_SOURCE.HOW_MUCH_INCOME.JOBSEEKER_INCOME',
        'ERRORS.TRANSACTION_SOURCE.HOW_OFTEN_RECEIVE.JOBSEEKER_INCOME',
      );
    });

    it('should display errors when Jobseeker contribution is selected but no amount or schedule are specified', async () => {
      await expectAmountAndScheduleErrors(
        'Jobseeker’s Allowance (contribution based)',
        'ERRORS.TRANSACTION_SOURCE.HOW_MUCH_INCOME.JOBSEEKER_CONTRIBUTION',
        'ERRORS.TRANSACTION_SOURCE.HOW_OFTEN_RECEIVE.JOBSEEKER_CONTRIBUTION',
      );
    });

    it('should display errors when income support is selected but no amount or schedule are specified', async () => {
      await expectAmountAndScheduleErrors(
        'Income Support',
        'ERRORS.TRANSACTION_SOURCE.HOW_MUCH_INCOME.INCOME_SUPPORT',
        'ERRORS.TRANSACTION_SOURCE.HOW_OFTEN_RECEIVE.INCOME_SUPPORT',
      );
    });

    it('should display errors when Working Tax Credit is selected but no amount or schedule are specified', async () => {
      await expectAmountAndScheduleErrors(
        'Working Tax Credit',
        'ERRORS.TRANSACTION_SOURCE.HOW_MUCH_INCOME.WORKING_TAX',
        'ERRORS.TRANSACTION_SOURCE.HOW_OFTEN_RECEIVE.WORKING_TAX',
      );
    });

    it('should display errors when Child Tax Credit is selected but no amount or schedule are specified', async () => {
      await expectAmountAndScheduleErrors(
        'Child Tax Credit',
        'ERRORS.TRANSACTION_SOURCE.HOW_MUCH_INCOME.CHILD_TAX',
        'ERRORS.TRANSACTION_SOURCE.HOW_OFTEN_RECEIVE.CHILD_TAX',
      );
    });

    it('should display errors when Child Benefit is selected but no amount or schedule are specified', async () => {
      await expectAmountAndScheduleErrors(
        'Child Benefit',
        'ERRORS.TRANSACTION_SOURCE.HOW_MUCH_INCOME.CHILD_BENEFIT',
        'ERRORS.TRANSACTION_SOURCE.HOW_OFTEN_RECEIVE.CHILD_BENEFIT',
      );
    });

    it('should display errors when Council Tax Support is selected but no amount or schedule are specified', async () => {
      await expectAmountAndScheduleErrors(
        'Council Tax Support',
        'ERRORS.TRANSACTION_SOURCE.HOW_MUCH_INCOME.COUNCIL_TAX',
        'ERRORS.TRANSACTION_SOURCE.HOW_OFTEN_RECEIVE.COUNCIL_TAX',
      );
    });

    it('should display errors when Pension is selected but no amount or schedule are specified', async () => {
      await expectAmountAndScheduleErrors(
        'Pension',
        'ERRORS.TRANSACTION_SOURCE.HOW_MUCH_INCOME.PENSION',
        'ERRORS.TRANSACTION_SOURCE.HOW_OFTEN_RECEIVE.PENSION',
      );
    });

    it('should display errors when other is selected but no amount or schedule are specified', async () => {
      await expectAmountAndScheduleErrors(
        'Other income',
        'ERRORS.TRANSACTION_SOURCE.HOW_MUCH_INCOME.OTHER',
        'ERRORS.TRANSACTION_SOURCE.HOW_OFTEN_RECEIVE.OTHER',
      );
    });

    it('should display errors for Income from your job amount when amount has more than two decimal places', async () => {
      await expectAmountFormatError('Income from your job', 'ERRORS.TRANSACTION_SOURCE.VALID_NUMBER_AMOUNT.INCOME_JOB');
    });

    it('should display errors for Universal Credit amount when amount has more than two decimal places', async () => {
      await expectAmountFormatError('Universal Credit', 'ERRORS.TRANSACTION_SOURCE.VALID_NUMBER_AMOUNT.UNIVERSAL_CREDIT');
    });

    it('should display errors for Jobseeker’s Allowance (income based) amount when amount has more than two decimal places', async () => {
      await expectAmountFormatError('Jobseeker’s Allowance (income based)', 'ERRORS.TRANSACTION_SOURCE.VALID_NUMBER_AMOUNT.JOBSEEKER_INCOME');
    });

    it('should display errors for Jobseeker’s Allowance (contribution based) amount when amount has more than two decimal places', async () => {
      await expectAmountFormatError('Jobseeker’s Allowance (contribution based)', 'ERRORS.TRANSACTION_SOURCE.VALID_NUMBER_AMOUNT.JOBSEEKER_CONTRIBUTION');
    });

    it('should display errors for Income Support amount when amount has more than two decimal places', async () => {
      await expectAmountFormatError('Income Support', 'ERRORS.TRANSACTION_SOURCE.VALID_NUMBER_AMOUNT.INCOME_SUPPORT');
    });

    it('should display errors for Working Tax Credit amount when amount has more than two decimal places', async () => {
      await expectAmountFormatError('Working Tax Credit', 'ERRORS.TRANSACTION_SOURCE.VALID_NUMBER_AMOUNT.WORKING_TAX');
    });

    it('should display errors for Child Tax Credit amount when amount has more than two decimal places', async () => {
      await expectAmountFormatError('Child Tax Credit', 'ERRORS.TRANSACTION_SOURCE.VALID_NUMBER_AMOUNT.CHILD_TAX');
    });

    it('should display errors for Child Benefit amount when amount has more than two decimal places', async () => {
      await expectAmountFormatError('Child Benefit', 'ERRORS.TRANSACTION_SOURCE.VALID_NUMBER_AMOUNT.CHILD_BENEFIT');
    });

    it('should display errors for Council Tax Support amount when amount has more than two decimal places', async () => {
      await expectAmountFormatError('Council Tax Support', 'ERRORS.TRANSACTION_SOURCE.VALID_NUMBER_AMOUNT.COUNCIL_TAX');
    });

    it('should display errors for Pension amount when amount has more than two decimal places', async () => {
      await expectAmountFormatError('Pension', 'ERRORS.TRANSACTION_SOURCE.VALID_NUMBER_AMOUNT.PENSION');
    });

    it('should display errors for other income amount when amount has more than two decimal places', async () => {
      await expectAmountFormatError('Other income', 'ERRORS.TRANSACTION_SOURCE.VALID_NUMBER_AMOUNT.OTHER');
    });

    it('should display errors for amount when amount is negative', async () => {
      req.body = jobIncomeBody('Income from your job', '-40.66', 'WEEK');

      await postHandler(req as AppRequest, res as unknown as Response, next);

      expect(errorTexts()).toContain('ERRORS.TRANSACTION_SOURCE.VALID_NUMBER_AMOUNT.INCOME_JOB');
    });

    it('should show errors when other is selected and data for other is not correctly selected', async () => {
      req.body = {
        declared: 'other',
        model: {
          other: {
            transactionSources: [
              {name: undefined, amount: '123.33', schedule: 'WEEK'},
              {name: 'Universal Credit', amount: '123.33', schedule: undefined},
              {name: 'Income Support', amount: '123.333', schedule: 'MONTH'},
            ],
          },
        },
      };

      await postHandler(req as AppRequest, res as unknown as Response, next);

      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({form: expect.any(GenericForm)}));
      expect(errorTexts()).toEqual(expect.arrayContaining([
        'ERRORS.TRANSACTION_SOURCE.ENTER_OTHER_INCOME',
        'ERRORS.TRANSACTION_SOURCE.HOW_OFTEN_RECEIVE.UNIVERSAL_CREDIT',
        'ERRORS.TRANSACTION_SOURCE.VALID_NUMBER_AMOUNT.INCOME_SUPPORT',
      ]));
    });

    it('should redirect when all values are correct', async () => {
      req.body = jobIncomeBody('income from your job', '40.66', 'WEEK');

      await postHandler(req as AppRequest, res as unknown as Response, next);

      expect(mockSaveRegularIncome).toHaveBeenCalled();
      expect(res.redirect).toHaveBeenCalledWith(constructResponseUrlWithIdParams(claimId, CITIZEN_EXPLANATION_URL));
    });

    it('should call next when save throws', async () => {
      const error = new Error('error');
      mockSaveRegularIncome.mockRejectedValue(error);
      req.body = jobIncomeBody('income from your job', '40.66', 'WEEK');

      await postHandler(req as AppRequest, res as unknown as Response, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });
});
