import {GenericForm} from '../../../../../../../main/common/form/models/genericForm';
import {
  RegularExpenses,
} from '../../../../../../../main/common/form/models/statementOfMeans/expensesAndIncome/regularExpenses';
import Transaction from '../../../../../../../main/common/form/models/statementOfMeans/expensesAndIncome/transaction';
import TransactionSource
  from '../../../../../../../main/common/form/models/statementOfMeans/expensesAndIncome/transactionSource';
import {TestMessages} from '../../../../../../utils/errorMessageTestConstants';

describe('Expenses', () => {
  describe('Validate', () => {
    it('should return no errors when empty form', async () => {
      //Given
      const form = new GenericForm(new RegularExpenses({
        mortgage: new Transaction(),
        rent: new Transaction(),
        tvAndBroadband: new Transaction(),
      }));
      //When
      await form.validate();
      //Then
      expect(form.hasErrors()).toBeFalsy();
    });
    it('should have errors for mortgage when mortgage declared is true', async () => {
      //Given
      const form = new GenericForm(new RegularExpenses({
        mortgage: new Transaction(true, new TransactionSource('mortgage')),
        rent: new Transaction(),
        tvAndBroadband: new Transaction(),
      }));
      //When
      await form.validate();
      //Then
      expect(form.hasErrors()).toBeTruthy();
      expect(form.getNestedErrors().length).toBe(3);
      expect(form.errorFor('mortgage[transactionSource][amount]')).toBe(TestMessages.MORTGAGE_AMOUNT_ERROR);
      expect(form.errorFor('mortgage[transactionSource][schedule]')).toBe(TestMessages.MORTGAGE_SCHEDULE_ERROR);
    });
  });
});
