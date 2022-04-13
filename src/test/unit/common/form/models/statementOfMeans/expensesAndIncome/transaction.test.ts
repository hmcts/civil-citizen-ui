import {Validator} from 'class-validator';
import Transaction from '../../../../../../../main/common/form/models/statementOfMeans/expensesAndIncome/transaction';
import TransactionSource
  from '../../../../../../../main/common/form/models/statementOfMeans/expensesAndIncome/transactionSource';
import {
  TransactionSchedule,
} from '../../../../../../../main/common/form/models/statementOfMeans/expensesAndIncome/transactionSchedule';
import {TestMessages} from '../../../../../../utils/errorMessageTestConstants';
import {ExpenseType} from '../../../../../../../main/common/form/models/statementOfMeans/expensesAndIncome/expenseType';

const validator = new Validator();
describe('Transaction', () => {
  describe('Validation', () => {
    it('should have errors when the declared is true', async () => {
      //Given
      const form = new Transaction(true, new TransactionSource('rent'));
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
      const form = new Transaction(false, new TransactionSource('rent'));
      //When
      const errors = await validator.validate(form);
      //Then
      expect(errors.length).toBe(0);
    });
    it('should have one nested error when declared is true and schedule  is not set', async () => {
      //Given
      const form = new Transaction(true, new TransactionSource('rent', 1));
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
      const form = new Transaction(true, new TransactionSource('rent', undefined, TransactionSchedule.MONTH));
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
      const form = Transaction.buildEmptyForm(expenseType);
      //Then
      expect(form.transactionSource?.name).toBe('rent');
      expect(form.transactionSource?.amount).toBeUndefined();
      expect(form.transactionSource?.schedule).toBeUndefined();
      expect(form.declared).toBeUndefined();
    });
    it('should build populated form successfully', () => {
      //Given
      const name = 'rent';
      const amount = '1000';
      const schedule = TransactionSchedule.MONTH;
      //When
      const form = Transaction.buildPopulatedForm(name, amount, schedule);
      //Then
      expect(form.declared).toBeTruthy();
      expect(form.transactionSource.name).toBe(name);
      expect(form.transactionSource.schedule).toBe(schedule);
      expect((form.transactionSource.amount)).toBe(Number(amount));
    });
  });
});
