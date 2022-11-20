import {ValidateNested} from 'class-validator';
import {ScheduledAmount} from '../../../utils/calculateMonthlyIncomeExpenses/monthlyIncomeExpensesCalculator';
import {ExpenseType} from './expensesAndIncome/expenseType';
import {Transaction} from './expensesAndIncome/transaction';
export class PriorityDebts {
  @ValidateNested()
    mortgage?: Transaction;

  @ValidateNested()
    rent?: Transaction;

  @ValidateNested()
    councilTax?: Transaction;

  @ValidateNested()
    gas?: Transaction;

  @ValidateNested()
    electricity?: Transaction;

  @ValidateNested()
    water?: Transaction;
  @ValidateNested()
    maintenance?: Transaction;

  [key: string]: Transaction;

  constructor(priorityDebts?: Record<string, Transaction>) {
    this.mortgage = priorityDebts?.mortgage;
    this.rent = priorityDebts?.rent;
    this.gas = priorityDebts?.gas;
    this.councilTax = priorityDebts?.councilTax;
    this.electricity = priorityDebts?.electricity;
    this.water = priorityDebts?.water;
    this.maintenance = priorityDebts?.maintenance;
  }

  public static buildEmptyForm(): PriorityDebts {
    const params = {
      mortgage: PriorityDebts.buildExpense(ExpenseType.MORTGAGE_PRIORITY),
      rent: PriorityDebts.buildExpense(ExpenseType.RENT_PRIORITY),
      councilTax: PriorityDebts.buildExpense(ExpenseType.COUNCIL_TAX_OR_COMMUNITY_CHARGE),
      gas: PriorityDebts.buildExpense(ExpenseType.GAS_PRIORITY),
      electricity: PriorityDebts.buildExpense(ExpenseType.ELECTRICITY_PRIORITY),
      water: PriorityDebts.buildExpense(ExpenseType.WATER_PRIORITY),
      maintenance: PriorityDebts.buildExpense(ExpenseType.MAINTENANCE_PAYMENTS_PRIORITY),
    };
    return new PriorityDebts(params);
  }

  public static convertToScheduledAmount(priorityDebts: PriorityDebts): ScheduledAmount[] {
    const keys = Object.keys(priorityDebts);
    const scheduledAmounts: ScheduledAmount[] = [];
    keys.forEach(key => {
      if (priorityDebts[key as keyof PriorityDebts]) {
        const expense = priorityDebts[key as keyof PriorityDebts];
        if (expense instanceof Transaction) {
          scheduledAmounts.push(expense?.transactionSource.convertToScheduledAmount());
        }
      }
    });
    return scheduledAmounts;
  }

  private static buildExpense(type: ExpenseType): Transaction {
    return Transaction.buildEmptyForm(type);
  }
}
