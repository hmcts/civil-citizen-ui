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
      mortgage: PriorityDebts.buildPriorityDebt(ExpenseType.MORTGAGE_DEBT),
      rent: PriorityDebts.buildPriorityDebt(ExpenseType.RENT_DEBT),
      councilTax: PriorityDebts.buildPriorityDebt(ExpenseType.COUNCIL_TAX_OR_COMMUNITY_CHARGE),
      gas: PriorityDebts.buildPriorityDebt(ExpenseType.GAS_DEBT),
      electricity: PriorityDebts.buildPriorityDebt(ExpenseType.ELECTRICITY_DEBT),
      water: PriorityDebts.buildPriorityDebt(ExpenseType.WATER_DEBT),
      maintenance: PriorityDebts.buildPriorityDebt(ExpenseType.MAINTENANCE_PAYMENTS_DEBT),
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

  private static buildPriorityDebt(type: ExpenseType): Transaction {
    return Transaction.buildEmptyForm(type);
  }
}
