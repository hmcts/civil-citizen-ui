import {RegularExpenses} from 'form/models/statementOfMeans/expensesAndIncome/regularExpenses';
import {Transaction} from 'form/models/statementOfMeans/expensesAndIncome/transaction';
import {OtherTransaction} from 'form/models/statementOfMeans/expensesAndIncome/otherTransaction';
import {TransactionSource} from 'form/models/statementOfMeans/expensesAndIncome/transactionSource';
import {TransactionSchedule} from 'form/models/statementOfMeans/expensesAndIncome/transactionSchedule';

describe('RegularExpenses', () => {
  describe('constructor', () => {
    it('should create RegularExpenses with undefined fields when params are not provided', () => {
      //When
      const result = new RegularExpenses();
      //Then
      expect(result.mortgage).toBeUndefined();
      expect(result.other).toBeUndefined();
    });
  });

  describe('convertToScheduledAmount', () => {
    it('should skip transactions without a transaction source', () => {
      //Given
      const regularExpenses = new RegularExpenses({
        mortgage: new Transaction(true, new TransactionSource({amount: 100, schedule: TransactionSchedule.MONTH})),
        rent: new Transaction(true, undefined),
      });
      //When
      const result = RegularExpenses.convertToScheduledAmount(regularExpenses);
      //Then
      expect(result).toEqual([{amount: 100, schedule: TransactionSchedule.MONTH}]);
    });

    it('should skip other transaction without transaction sources', () => {
      //Given
      const regularExpenses = new RegularExpenses({
        other: new OtherTransaction(true, undefined),
      });
      //When
      const result = RegularExpenses.convertToScheduledAmount(regularExpenses);
      //Then
      expect(result).toEqual([]);
    });
  });
});
