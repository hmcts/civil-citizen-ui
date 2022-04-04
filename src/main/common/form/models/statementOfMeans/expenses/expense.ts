import ExpenseSource from './expenseSource';
import {ValidateIf, ValidateNested} from 'class-validator';
import {ExpenseType} from './expenseType';

export default class Expense {
  declared: boolean;

  @ValidateIf((o: Expense) => o.declared === true)
  @ValidateNested()
    expenseSource: ExpenseSource;

  constructor(declared?: boolean, expenseSource?: ExpenseSource) {
    this.declared = declared;
    this.expenseSource = expenseSource;
  }

  public static buildEmptyForm(type: ExpenseType): Expense {
    return new Expense(undefined, new ExpenseSource(type));
  }
}
