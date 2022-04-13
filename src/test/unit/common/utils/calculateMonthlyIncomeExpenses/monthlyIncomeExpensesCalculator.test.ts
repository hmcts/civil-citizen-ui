import {
  RegularExpenses,
} from '../../../../../main/common/form/models/statementOfMeans/expensesAndIncome/regularExpenses';
import Transaction from '../../../../../main/common/form/models/statementOfMeans/expensesAndIncome/transaction';
import {
  TransactionSchedule,
} from '../../../../../main/common/form/models/statementOfMeans/expensesAndIncome/transactionSchedule';
import {ExpenseType} from '../../../../../main/common/form/models/statementOfMeans/expensesAndIncome/expenseType';
import {
  calculateTotalAmount,
} from '../../../../../main/common/utils/calculateMonthlyIncomeExpenses/monthlyIncomeExpensesCalculator';

describe('calculate monthly income expenses', () => {
  it('should calculate monthly income expenses successfully', () => {
    //Given
    const regularExpenses = new RegularExpenses({
      rent: Transaction.buildPopulatedForm('rent', '10', TransactionSchedule.WEEK),
      tvAndBroadband: Transaction.buildPopulatedForm('tvAndBroadband', '20', TransactionSchedule.MONTH),
      mortgage: Transaction.buildEmptyForm(ExpenseType.MORTGAGE),
    });
    //When
    const total = calculateTotalAmount(RegularExpenses.convertToScheduledAmount(regularExpenses));
    //Then
    expect(total).toBe('63');
  });
  it('should not calculate when there is no data', () => {
    //When
    const total = calculateTotalAmount(undefined);
    //Then
    expect(total).toBe('0');
  });
});
