import Expense from './expense';
import {ValidateNested} from 'class-validator';
import {ExpenseType} from './expenseType';
import {ScheduledAmount} from '../../../../utils/calculateMonthlyIncomeExpenses/monthlyIncomeExpensesCalculator';
import OtherTransaction from './otherTransaction';
import ExpenseSource from 'common/form/models/statementOfMeans/expenses/expenseSource';

export interface ExpenseParams {
  mortgage?: Expense;
  rent?: Expense;
  councilTax?: Expense;
  gas?: Expense;
  electricity?: Expense;
  water?: Expense;
  travel?: Expense;
  schoolCosts?: Expense;
  foodAndHousekeeping?: Expense;
  tvAndBroadband?: Expense;
  hirePurchase?: Expense;
  mobilePhone?: Expense;
  maintenance?: Expense;
  other?: OtherTransaction;
}

export interface ResponseExpenseParams {
  declared: string[];
  model: ExpenseParams;
}

export class RegularExpenses {
  @ValidateNested()
    mortgage?: Expense;

  @ValidateNested()
    rent?: Expense;

  @ValidateNested()
    councilTax?: Expense;

  @ValidateNested()
    gas?: Expense;

  @ValidateNested()
    electricity?: Expense;

  @ValidateNested()
    water?: Expense;

  @ValidateNested()
    travel?: Expense;

  @ValidateNested()
    schoolCosts?: Expense;

  @ValidateNested()
    foodAndHousekeeping?: Expense;

  @ValidateNested()
    tvAndBroadband?: Expense;

  @ValidateNested()
    hirePurchase?: Expense;

  @ValidateNested()
    mobilePhone?: Expense;

  @ValidateNested()
    maintenance?: Expense;

  @ValidateNested()
    other?: OtherTransaction;

  [key: string]: Expense | OtherTransaction;

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
      other: new OtherTransaction(false, [new ExpenseSource()]),
    };
    return new RegularExpenses(params);
  }

  public static convertToScheduledAmount(regularExpenses: RegularExpenses): ScheduledAmount[] {
    const keys = Object.keys(regularExpenses);
    const scheduledAmounts: ScheduledAmount[] = [];
    keys.forEach(key => {
      if (regularExpenses[key as keyof RegularExpenses]) {
        const expense = regularExpenses[key as keyof RegularExpenses];
        if (expense instanceof Expense) {
          scheduledAmounts.push(expense?.expenseSource.convertToScheduledAmount());
        } else {
          expense.transactionSources.forEach(transactionSource => scheduledAmounts.push(transactionSource?.convertToScheduledAmount()));
        }
      }
    });
    return scheduledAmounts;
  }

  private static buildExpense(type: ExpenseType): Expense {
    return Expense.buildEmptyForm(type);
  }
}
