import {GenericForm} from '../../../../../../../main/common/form/models/genericForm';
import {RegularExpenses} from '../../../../../../../main/common/form/models/statementOfMeans/expenses/regularExpenses';
import Expense from '../../../../../../../main/common/form/models/statementOfMeans/expenses/expense';
import ExpenseSource from '../../../../../../../main/common/form/models/statementOfMeans/expenses/expenseSource';
import {TestMessages} from '../../../../../../utils/errorMessageTestConstants';

describe('Expenses', () => {
  describe('Validate', () => {
    it('should return errors when empty form', async () => {
      //Given
      const form = new GenericForm(new RegularExpenses({
        mortgage: new Expense(),
        rent: new Expense(),
        tvAndBroadband: new Expense(),
      }));
      //When
      await form.validate();
      //Then
      expect(form.hasErrors()).toBeFalsy();
    });
    it('should have errors for mortgage when mortgage declared is true', async () => {
      //Given
      const form = new GenericForm(new RegularExpenses({
        mortgage: new Expense(true, new ExpenseSource('mortgage')),
        rent: new Expense(),
        tvAndBroadband: new Expense(),
      }));
      //When
      await form.validate();
      //Then
      expect(form.hasErrors()).toBeTruthy();
      expect(form.getNestedErrors().length).toBe(3);
      expect(form.errorFor('mortgage[expenseSource][amount]')).toBe(TestMessages.MORTGAGE_AMOUNT_ERROR);
      expect(form.errorFor('mortgage[expenseSource][schedule]')).toBe(TestMessages.MORTGAGE_SCHEDULE_ERROR);
    });
  });
});
