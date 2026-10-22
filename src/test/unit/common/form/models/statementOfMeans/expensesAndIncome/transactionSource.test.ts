import {GenericForm} from 'common/form/models/genericForm';
import {ExpenseType} from 'form/models/statementOfMeans/expensesAndIncome/expenseType';
import {IncomeType} from 'form/models/statementOfMeans/expensesAndIncome/incomeType';
import {
  TransactionSource,
  ValidationErrors,
} from 'form/models/statementOfMeans/expensesAndIncome/transactionSource';
import {TransactionSchedule} from 'form/models/statementOfMeans/expensesAndIncome/transactionSchedule';

describe('TransactionSource', () => {
  describe('constructor', () => {
    it('should assign all params', () => {
      const source = new TransactionSource({
        name: 'mortgage',
        amount: 100.5,
        schedule: TransactionSchedule.MONTH,
        isIncome: false,
        nameRequired: true,
      });

      expect(source.name).toBe('mortgage');
      expect(source.amount).toBe(100.5);
      expect(source.schedule).toBe(TransactionSchedule.MONTH);
      expect(source.isIncome).toBe(false);
      expect(source.nameRequired).toBe(true);
    });
  });

  describe('convertToScheduledAmount', () => {
    it('should return amount and schedule', () => {
      const source = new TransactionSource({
        amount: 50,
        schedule: TransactionSchedule.WEEK,
      });

      expect(source.convertToScheduledAmount()).toEqual({
        amount: 50,
        schedule: TransactionSchedule.WEEK,
      });
    });
  });

  describe('validation', () => {
    it('should pass with valid expense values', async () => {
      const form = new GenericForm(new TransactionSource({
        name: ExpenseType.RENT,
        amount: 200,
        schedule: TransactionSchedule.MONTH,
        isIncome: false,
        nameRequired: false,
      }));

      await form.validate();

      expect(form.hasErrors()).toBeFalsy();
    });

    it('should require name when nameRequired is true', async () => {
      const form = new GenericForm(new TransactionSource({
        amount: 10,
        schedule: TransactionSchedule.WEEK,
        isIncome: true,
        nameRequired: true,
      }));

      await form.validate();

      expect(form.errorFor('name')).toBe('ERRORS.TRANSACTION_SOURCE.ENTER_OTHER_INCOME');
    });

    it('should require expense name message when nameRequired and not income', async () => {
      const form = new GenericForm(new TransactionSource({
        amount: 10,
        schedule: TransactionSchedule.WEEK,
        isIncome: false,
        nameRequired: true,
      }));

      await form.validate();

      expect(form.errorFor('name')).toBe('ERRORS.EXPENSES_ENTER_OTHER_SOURCE');
    });

    it('should require amount', async () => {
      const form = new GenericForm(new TransactionSource({
        name: IncomeType.JOB,
        schedule: TransactionSchedule.MONTH,
        isIncome: true,
      }));

      await form.validate();

      expect(form.errorFor('amount')).toBe('ERRORS.TRANSACTION_SOURCE.HOW_MUCH_INCOME.INCOME_JOB');
    });

    it('should reject negative amount', async () => {
      const form = new GenericForm(new TransactionSource({
        name: ExpenseType.GAS,
        amount: -1,
        schedule: TransactionSchedule.MONTH,
        isIncome: false,
      }));

      await form.validate();

      expect(form.errorFor('amount')).toBe('ERRORS.EXPENSES_AMOUNT_FORMAT.GAS');
    });

    it('should require schedule', async () => {
      const form = new GenericForm(new TransactionSource({
        name: IncomeType.PENSION,
        amount: 100,
        isIncome: true,
      }));

      await form.validate();

      expect(form.errorFor('schedule')).toBe('ERRORS.TRANSACTION_SOURCE.HOW_OFTEN_RECEIVE.PENSION');
    });
  });
});

describe('ValidationErrors message builders', () => {
  describe('NAME_REQUIRED', () => {
    it('should return income message when isIncome', () => {
      expect(ValidationErrors.NAME_REQUIRED('other', true)).toBe('ERRORS.TRANSACTION_SOURCE.ENTER_OTHER_INCOME');
    });

    it('should return expense message when not income', () => {
      expect(ValidationErrors.NAME_REQUIRED('other', false)).toBe('ERRORS.EXPENSES_ENTER_OTHER_SOURCE');
    });
  });

  describe('AMOUNT_REQUIRED', () => {
    it.each([
      [IncomeType.JOB, 'INCOME_JOB'],
      [IncomeType.UNIVERSAL_CREDIT, 'UNIVERSAL_CREDIT'],
      [IncomeType.JOB_SEEKERS_ALLOWANCE_INCOME_BASED, 'JOBSEEKER_INCOME'],
      [IncomeType.JOB_SEEKERS_ALLOWANCE_CONTRIBUTION_BASED, 'JOBSEEKER_CONTRIBUTION'],
      [IncomeType.INCOME_SUPPORT, 'INCOME_SUPPORT'],
      [IncomeType.WORKING_TAX_CREDIT, 'WORKING_TAX'],
      [IncomeType.CHILD_TAX_CREDIT, 'CHILD_TAX'],
      [IncomeType.CHILD_BENEFIT, 'CHILD_BENEFIT'],
      [IncomeType.COUNCIL_TAX_SUPPORT, 'COUNCIL_TAX'],
      [IncomeType.PENSION, 'PENSION'],
      ['unknown income', 'OTHER'],
    ])('should map income source %s', (sourceName, key) => {
      expect(ValidationErrors.AMOUNT_REQUIRED(sourceName, true))
        .toBe(`ERRORS.TRANSACTION_SOURCE.HOW_MUCH_INCOME.${key}`);
    });

    it.each([
      [ExpenseType.MORTGAGE, 'MORTGAGE'],
      [ExpenseType.MORTGAGE_DEBT, 'MORTGAGE_DEBT'],
      [ExpenseType.RENT, 'RENT'],
      [ExpenseType.RENT_DEBT, 'RENT_DEBT'],
      [ExpenseType.COUNCIL_TAX, 'COUNCIL_TAX'],
      [ExpenseType.COUNCIL_TAX_OR_COMMUNITY_CHARGE, 'COUNCIL_TAX_OR_COMMUNITY_CHARGE'],
      [ExpenseType.GAS, 'GAS'],
      [ExpenseType.GAS_DEBT, 'GAS_DEBT'],
      [ExpenseType.WATER, 'WATER'],
      [ExpenseType.WATER_DEBT, 'WATER_DEBT'],
      [ExpenseType.ELECTRICITY, 'ELECTRICITY'],
      [ExpenseType.ELECTRICITY_DEBT, 'ELECTRICITY_DEBT'],
      [ExpenseType.TRAVEL, 'TRAVEL'],
      [ExpenseType.SCHOOL_COSTS, 'SCHOOL_COSTS'],
      [ExpenseType.FOOD_HOUSEKEEPING, 'FOOD_HOUSEKEEPING'],
      [ExpenseType.TV_AND_BROADBAND, 'TV_AND_BROADBAND'],
      [ExpenseType.HIRE_PURCHASES, 'HIRE_PURCHASES'],
      [ExpenseType.MOBILE_PHONE, 'MOBILE_PHONE'],
      [ExpenseType.MAINTENANCE_PAYMENTS, 'MAINTENANCE_PAYMENTS'],
      [ExpenseType.MAINTENANCE_PAYMENTS_DEBT, 'MAINTENANCE_PAYMENTS_DEBT'],
      ['unknown expense', 'OTHER'],
    ])('should map expense source %s for amount required', (sourceName, key) => {
      expect(ValidationErrors.AMOUNT_REQUIRED(sourceName, false))
        .toBe(`ERRORS.EXPENSES_AMOUNT.${key}`);
    });
  });

  describe('AMOUNT_NON_NEGATIVE_NUMBER_REQUIRED', () => {
    it('should return income format key', () => {
      expect(ValidationErrors.AMOUNT_NON_NEGATIVE_NUMBER_REQUIRED(IncomeType.JOB, true))
        .toBe('ERRORS.TRANSACTION_SOURCE.VALID_NUMBER_AMOUNT.INCOME_JOB');
    });

    it('should return expense format key', () => {
      expect(ValidationErrors.AMOUNT_NON_NEGATIVE_NUMBER_REQUIRED(ExpenseType.RENT, false))
        .toBe('ERRORS.EXPENSES_AMOUNT_FORMAT.RENT');
    });
  });

  describe('SCHEDULE_SELECT_AN_OPTION', () => {
    it('should return income schedule key', () => {
      expect(ValidationErrors.SCHEDULE_SELECT_AN_OPTION(IncomeType.CHILD_BENEFIT, true))
        .toBe('ERRORS.TRANSACTION_SOURCE.HOW_OFTEN_RECEIVE.CHILD_BENEFIT');
    });

    it('should return expense schedule key', () => {
      expect(ValidationErrors.SCHEDULE_SELECT_AN_OPTION(ExpenseType.TRAVEL, false))
        .toBe('ERRORS.EXPENSES_FREQUENCY.TRAVEL');
    });
  });

  describe('generateErrorMessage helpers', () => {
    it('should generate payment amount message', () => {
      expect(ValidationErrors.generateErrorMessageForValidPaymentAmount(ExpenseType.WATER))
        .toBe('ERRORS.EXPENSES_AMOUNT.WATER');
    });

    it('should generate schedule frequency message', () => {
      expect(ValidationErrors.generateErrorMessageForValidScheduleFrequency(ExpenseType.GAS))
        .toBe('ERRORS.EXPENSES_FREQUENCY.GAS');
    });

    it('should generate payment amount format message', () => {
      expect(ValidationErrors.generateErrorMessageForValidPaymentAmountFormat(ExpenseType.ELECTRICITY))
        .toBe('ERRORS.EXPENSES_AMOUNT_FORMAT.ELECTRICITY');
    });
  });

  describe('withMessage', () => {
    it('should pass name and isIncome from validation object', () => {
      const messageFn = ValidationErrors.withMessage(ValidationErrors.AMOUNT_REQUIRED);
      const result = messageFn({
        object: new TransactionSource({
          name: IncomeType.JOB,
          isIncome: true,
        }),
      } as never);

      expect(result).toBe('ERRORS.TRANSACTION_SOURCE.HOW_MUCH_INCOME.INCOME_JOB');
    });
  });
});
