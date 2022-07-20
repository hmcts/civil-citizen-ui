import {GenericForm} from '../../../../../../../main/common/form/models/genericForm';
import RegularIncome
  from '../../../../../../../main/common/form/models/statementOfMeans/expensesAndIncome/regularIncome';
import {IncomeType} from '../../../../../../../main/common/form/models/statementOfMeans/expensesAndIncome/incomeType';
import Transaction from '../../../../../../../main/common/form/models/statementOfMeans/expensesAndIncome/transaction';

describe('Regular Income', () => {
  describe('Validation', () => {
    it('should return no errors when empty form', async () => {
      //Given
      const form = new GenericForm(RegularIncome.buildEmptyForm());
      //When
      await form.validate();
      //Then
      expect(form.hasErrors()).toBeFalsy();
    });
    it('should return errors when job income is set to true and no amount or schedule is specified', async () => {
      //Given
      const form = new GenericForm(new RegularIncome({
        job: Transaction.buildPopulatedForm(IncomeType.JOB, undefined, undefined, true),
      }));
      //When
      await form.validate();
      //Then
      expect(form.hasErrors()).toBeTruthy();
      expect(form.errorFor('job[transactionSource][amount]')).toBe('ERRORS.TRANSACTION_SOURCE.HOW_MUCH_INCOME.INCOME_JOB');
    });
  });
});
