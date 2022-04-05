import Expense from './expense';
import {ValidateNested} from 'class-validator';
import {ExpenseType} from './expenseType';

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

  [key: string]: Expense;

  constructor(expenseParams?: ExpenseParams) {
    this.mortgage = expenseParams?.mortgage;
    this.rent = expenseParams?.rent;
    this.gas = expenseParams?.gas;
    this.councilTax = expenseParams?.councilTax;
    this.electricity = expenseParams?.electricity;
    this.water = expenseParams?.water;
    this.schoolCosts = expenseParams?.schoolCosts;
    this.foodAndHousekeeping = expenseParams?.foodAndHousekeeping;
    this.hirePurchase = expenseParams?.hirePurchase;
    this.mobilePhone = expenseParams?.mobilePhone;
    this.maintenance = expenseParams?.maintenance;
  }

  public static buildEmptyForm(): RegularExpenses {
    const params = {
      mortgage: RegularExpenses.buildExpense(ExpenseType.MORTGAGE),
      rent: RegularExpenses.buildExpense(ExpenseType.RENT),
      councilTax: RegularExpenses.buildExpense(ExpenseType.COUNCIL_TAX),
      gas: RegularExpenses.buildExpense(ExpenseType.GAS),
      electricity: RegularExpenses.buildExpense(ExpenseType.ELECTRICITY),
      water: RegularExpenses.buildExpense(ExpenseType.WATER),
      travel: RegularExpenses.buildExpense(ExpenseType.WATER),
      schoolCosts: RegularExpenses.buildExpense(ExpenseType.SCHOOL_COSTS),
      foodAndHousekeeping: RegularExpenses.buildExpense(ExpenseType.FOOD_HOUSEKEEPING),
      tvAndBroadband: RegularExpenses.buildExpense(ExpenseType.TV_AND_BROADBAND),
      hirePurchase: RegularExpenses.buildExpense(ExpenseType.HIRE_PURCHASES),
      mobilePhone: RegularExpenses.buildExpense(ExpenseType.MOBILE_PHONE),
      maintenance: RegularExpenses.buildExpense(ExpenseType.MAINTENANCE_PAYMENTS),
    };
    return new RegularExpenses(params);
  }

  private static buildExpense(type: ExpenseType): Expense {
    return Expense.buildEmptyForm(type);
  }

}
