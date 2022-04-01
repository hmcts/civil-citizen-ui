import ExpenseSource from './expenseSource';
import {ValidateIf, ValidateNested} from 'class-validator';

export default class Expense {
  declared: boolean;

  @ValidateIf((o: Expense) => o.declared === true)
  @ValidateNested()
    expenseSource: ExpenseSource;

  constructor(declared?: boolean, expenseSource?: ExpenseSource) {
    this.declared = declared;
    console.log(declared);
    this.expenseSource = expenseSource;
  }
}
