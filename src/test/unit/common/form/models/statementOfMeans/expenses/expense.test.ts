import {Validator} from 'class-validator';
import Expense from '../../../../../../../main/common/form/models/statementOfMeans/expenses/expense';
import ExpenseSource from '../../../../../../../main/common/form/models/statementOfMeans/expenses/expenseSource';
import {
  ScheduledExpenses,
} from '../../../../../../../main/common/form/models/statementOfMeans/expenses/scheduledExpenses';

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
    });
    it('should have one nested error when declared is true and schedule  is not set', async () => {
      //Given
      const form = new Expense(true, new ExpenseSource('rent', undefined, ScheduledExpenses.MONTH));
      //When
      const errors = await validator.validate(form);
      //Then
      expect(errors.length).toBe(1);
      expect(errors[0].children?.length).toBe(1);
    });
  });
});
