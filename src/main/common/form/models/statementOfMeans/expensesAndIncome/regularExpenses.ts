import Transaction from './transaction';
import {ValidateNested} from 'class-validator';
import {ExpenseType} from './expenseType';
import {ScheduledAmount} from '../../../../utils/calculateMonthlyIncomeExpenses/monthlyIncomeExpensesCalculator';
import OtherTransaction from './otherTransaction';

export interface ExpenseParams {
  mortgage?: Transaction;
  rent?: Transaction;
  councilTax?: Transaction;
  gas?: Transaction;
  electricity?: Transaction;
  water?: Transaction;
  travel?: Transaction;
  schoolCosts?: Transaction;
  foodAndHousekeeping?: Transaction;
  tvAndBroadband?: Transaction;
  hirePurchase?: Transaction;
  mobilePhone?: Transaction;
  maintenance?: Transaction;
  other?: OtherTransaction;
}

export interface ResponseExpenseParams {
  declared: string[];
  model: ExpenseParams;
}

export class RegularExpenses {
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
    travel?: Transaction;

  @ValidateNested()
    schoolCosts?: Transaction;

  @ValidateNested()
    foodAndHousekeeping?: Transaction;

  @ValidateNested()
    tvAndBroadband?: Transaction;

  @ValidateNested()
    hirePurchase?: Transaction;

  @ValidateNested()
    mobilePhone?: Transaction;

  @ValidateNested()
    maintenance?: Transaction;

  @ValidateNested()
    other?: OtherTransaction;

  [key: string]: Transaction | OtherTransaction;

  constructor(expenseParams?: ExpenseParams) {
    this.mortgage = expenseParams?.mortgage;
    this.rent = expenseParams?.rent;
    this.gas = expenseParams?.gas;
    this.councilTax = expenseParams?.councilTax;
    this.electricity = expenseParams?.electricity;
    this.water = expenseParams?.water;
    this.travel = expenseParams?.travel;
    this.schoolCosts = expenseParams?.schoolCosts;
    this.foodAndHousekeeping = expenseParams?.foodAndHousekeeping;
    this.tvAndBroadband = expenseParams?.tvAndBroadband;
    this.hirePurchase = expenseParams?.hirePurchase;
    this.mobilePhone = expenseParams?.mobilePhone;
    this.maintenance = expenseParams?.maintenance;
    this.other = expenseParams.other;
  }

  public static buildEmptyForm(): RegularExpenses {
    const params = {
      mortgage: RegularExpenses.buildExpense(ExpenseType.MORTGAGE),
      rent: RegularExpenses.buildExpense(ExpenseType.RENT),
      councilTax: RegularExpenses.buildExpense(ExpenseType.COUNCIL_TAX),
      gas: RegularExpenses.buildExpense(ExpenseType.GAS),
      electricity: RegularExpenses.buildExpense(ExpenseType.ELECTRICITY),
      water: RegularExpenses.buildExpense(ExpenseType.WATER),
      travel: RegularExpenses.buildExpense(ExpenseType.TRAVEL),
      schoolCosts: RegularExpenses.buildExpense(ExpenseType.SCHOOL_COSTS),
      foodAndHousekeeping: RegularExpenses.buildExpense(ExpenseType.FOOD_HOUSEKEEPING),
      tvAndBroadband: RegularExpenses.buildExpense(ExpenseType.TV_AND_BROADBAND),
      hirePurchase: RegularExpenses.buildExpense(ExpenseType.HIRE_PURCHASES),
      mobilePhone: RegularExpenses.buildExpense(ExpenseType.MOBILE_PHONE),
      maintenance: RegularExpenses.buildExpense(ExpenseType.MAINTENANCE_PAYMENTS),
      other: OtherTransaction.buildEmptyForm(false),
    };
    return new RegularExpenses(params);
  }

  public static convertToScheduledAmount(regularExpenses: RegularExpenses): ScheduledAmount[] {
    const keys = Object.keys(regularExpenses);
    const scheduledAmounts: ScheduledAmount[] = [];
    keys.forEach(key => {
      if (regularExpenses[key as keyof RegularExpenses]) {
        const expense = regularExpenses[key as keyof RegularExpenses];
        if (expense instanceof Transaction) {
          scheduledAmounts.push(expense?.transactionSource.convertToScheduledAmount());
        } else {
          expense.transactionSources.forEach(transactionSource => scheduledAmounts.push(transactionSource?.convertToScheduledAmount()));
        }
      }
    });
    return scheduledAmounts;
  }

  private static buildExpense(type: ExpenseType): Transaction {
    return Transaction.buildEmptyForm(type);
  }
}
