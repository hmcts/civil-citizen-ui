import {PriorityDebts} from 'form/models/statementOfMeans/priorityDebts';
import {Transaction} from 'form/models/statementOfMeans/expensesAndIncome/transaction';
import {TransactionSource} from 'form/models/statementOfMeans/expensesAndIncome/transactionSource';
import {TransactionSchedule} from 'form/models/statementOfMeans/expensesAndIncome/transactionSchedule';

describe('PriorityDebts', () => {
  describe('convertToScheduledAmount', () => {
    it('should skip transactions without a transaction source', () => {
      //Given
      const priorityDebts = new PriorityDebts({
        mortgage: new Transaction(true, new TransactionSource({amount: 50, schedule: TransactionSchedule.WEEK})),
        rent: new Transaction(true, undefined),
      });
      //When
      const result = PriorityDebts.convertToScheduledAmount(priorityDebts);
      //Then
      expect(result).toEqual([{amount: 50, schedule: TransactionSchedule.WEEK}]);
    });
  });
});
