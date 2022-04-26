import {ValidateIf, ValidateNested} from 'class-validator';
import ExpenseSource from './expenseSource';
import {ScheduledExpenses} from './scheduledExpenses';
import {toNumberOrUndefined} from '../../../../utils/numberConverter';

export interface OtherTransactionRequestParams {
  name?: string;
  amount?: string;
  schedule?: ScheduledExpenses;
}

export default class OtherTransaction {
  declared: boolean;
  @ValidateIf((o: OtherTransaction) => o.declared === true)
  @ValidateNested({each: true})
    transactionSources: ExpenseSource[];

  constructor(declared?: boolean, transactionSources?: ExpenseSource[]) {
    this.declared = declared;
    this.transactionSources = transactionSources;
  }

  static buildPopulatedForm(otherTransactions: OtherTransactionRequestParams[]): OtherTransaction {
    const otherTransactionSources: ExpenseSource[] = [];
    if (otherTransactions?.length) {
      otherTransactions.forEach(transaction => otherTransactionSources.push(new ExpenseSource(transaction.name, toNumberOrUndefined(transaction.amount), transaction.schedule, true)));
    }
    return new OtherTransaction(true, otherTransactionSources);
  }
}
