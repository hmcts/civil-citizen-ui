import Expense from './expense';
import {ValidateNested} from 'class-validator';

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
  maintenance?: Expense;
}

export class Expenses {
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
    maintenance?: Expense;

  constructor(expenseParams: ExpenseParams) {
    this.mortgage = expenseParams.mortgage;
    this.rent = expenseParams.rent;
    this.gas = expenseParams.gas;
    this.councilTax = expenseParams.councilTax;
    this.electricity = expenseParams.electricity;
    this.water = expenseParams.water;
    this.schoolCosts = expenseParams.schoolCosts;
    this.foodAndHousekeeping = expenseParams.foodAndHousekeeping;
    this.hirePurchase = expenseParams.hirePurchase;
    this.maintenance = expenseParams.maintenance;
  }

}
