import {Validator} from 'class-validator';
import Expense from '../../../../../../../main/common/form/models/statementOfMeans/expenses/expense';
import ExpenseSource from '../../../../../../../main/common/form/models/statementOfMeans/expenses/expenseSource';
import {
  ScheduledExpenses,
} from '../../../../../../../main/common/form/models/statementOfMeans/expenses/scheduledExpenses';
import {TestMessages} from '../../../../../../utils/errorMessageTestConstants';
import {ExpenseType} from '../../../../../../../main/common/form/models/statementOfMeans/expenses/expenseType';

const validator = new Validator();
describe('Expense', () => {
  describe('Validation', () => {
    it('should have errors when the declared is true', async () => {
      //Given
      const form = new Expense(true, new ExpenseSource('rent'));
      //When
      const errors = await validator.validate(form);
      //Then
      expect(errors.length).toBe(1);
      expect(errors[0].children?.length).toBe(2);
      if (errors[0].children) {
        expect(errors[0].children[0].constraints?.isDefined).toBe(TestMessages.RENT_AMOUNT_ERROR);
        expect(errors[0].children[1].constraints?.isDefined).toBe(TestMessages.RENT_SCHEDULE_ERROR);
      }
    });
    it('should not have errors when declared is false', async () => {
      //Given
      const form = new Expense(false, new ExpenseSource('rent'));
      //When
      const errors = await validator.validate(form);
      //Then
      expect(errors.length).toBe(0);
    });
    it('should have one nested error when declared is true and schedule  is not set', async () => {
      //Given
      const form = new Expense(true, new ExpenseSource('rent', 1));
      //When
      const errors = await validator.validate(form);
      //Then
      expect(errors.length).toBe(1);
      expect(errors[0].children?.length).toBe(1);
      if (errors[0].children) {
        expect(errors[0].children[0].constraints?.isDefined).toBe(TestMessages.RENT_SCHEDULE_ERROR);
      }
    });
    it('should have one nested error when declared is true and schedule  is not set', async () => {
      //Given
      const form = new Expense(true, new ExpenseSource('rent', undefined, ScheduledExpenses.MONTH));
      //When
      const errors = await validator.validate(form);
      //Then
      expect(errors.length).toBe(1);
      expect(errors[0].children?.length).toBe(1);
      if (errors[0].children) {
        expect(errors[0].children[0].constraints?.isDefined).toBe(TestMessages.RENT_AMOUNT_ERROR);
      }
    });
  });
  describe('Build form', () => {
    it('should build empty form successfully', () => {
      //Given
      const expenseType = ExpenseType.RENT;
      //When
      const form = Expense.buildEmptyForm(expenseType);
      //Then
      expect(form.expenseSource?.name).toBe('rent');
      expect(form.expenseSource?.amount).toBeUndefined();
      expect(form.expenseSource?.schedule).toBeUndefined();
      expect(form.declared).toBeUndefined();
    });
    it('should build populated form successfully', () => {
      //Given
      const name = 'rent';
      const amount = '1000';
      const schedule = ScheduledExpenses.MONTH;
      //When
      const form = Expense.buildPopulatedForm(name, amount, schedule);
      //Then
      expect(form.declared).toBeTruthy();
      expect(form.expenseSource.name).toBe(name);
      expect(form.expenseSource.schedule).toBe(schedule);
      expect((form.expenseSource.amount)).toBe(Number(amount));
    });
  });
});
