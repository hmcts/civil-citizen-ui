import {RegularExpenses} from '../../../../../main/common/form/models/statementOfMeans/expenses/regularExpenses';
import Expense from '../../../../../main/common/form/models/statementOfMeans/expenses/expense';
import {ScheduledExpenses} from '../../../../../main/common/form/models/statementOfMeans/expenses/scheduledExpenses';
import {ExpenseType} from '../../../../../main/common/form/models/statementOfMeans/expenses/expenseType';
import {
  calculateTotalAmount,
} from '../../../../../main/common/utils/calculateMonthlyIncomeExpeses/monthlyIncomeExpensesCalculator';

describe('calculate monthly income expenses', () => {
  it('should calculate monthly income expenses successfully', () => {
    //Given
    const regularExpenses = new RegularExpenses({
      rent: Expense.buildPopulatedForm('rent', '10', ScheduledExpenses.WEEK),
      tvAndBroadband: Expense.buildPopulatedForm('tvAndBroadband', '20', ScheduledExpenses.MONTH),
      mortgage: Expense.buildEmptyForm(ExpenseType.MORTGAGE),
    });
    //When
    const total = calculateTotalAmount(RegularExpenses.convertToScheduledAmount(regularExpenses));
    //Then
    expect(total).toBe('63');

  });
});
