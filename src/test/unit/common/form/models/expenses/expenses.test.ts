import {GenericForm} from '../../../../../../main/common/form/models/genericForm';
import {Expenses} from '../../../../../../main/common/form/models/statementOfMeans/expenses/expenses';
import Expense from '../../../../../../main/common/form/models/statementOfMeans/expenses/expense';

describe('Expenses', () => {
  describe('Validate', () => {
    it('should return errors when empty form', async () => {
      //Given
      const form = new GenericForm(new Expenses({
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
      const form = new GenericForm(new Expenses({
        mortgage: new Expense(true),
        rent: new Expense(),
        tvAndBroadband: new Expense(),
      }));
      //When
      await form.validate();
      //Then
      expect(form.hasErrors()).toBeTruthy();
    });
  });
});
