import {ValidateIf, ValidateNested} from 'class-validator';
import TransactionSource from './transactionSource';
import {TransactionSchedule} from './transactionSchedule';
import {toNumberOrUndefined} from '../../../../utils/numberConverter';

export interface OtherTransactionRequestParams {
  name?: string;
  amount?: string;
  schedule?: TransactionSchedule;
}

export default class OtherTransaction {
  declared: boolean;
  @ValidateIf((o: OtherTransaction) => o.declared === true)
  @ValidateNested({each: true})
    transactionSources: TransactionSource[];

  constructor(declared?: boolean, transactionSources?: TransactionSource[]) {
    this.declared = declared;
    this.transactionSources = transactionSources;
  }

  static buildPopulatedForm(otherTransactions: OtherTransactionRequestParams[]): OtherTransaction {
    const otherTransactionSources: TransactionSource[] = [];
    if (otherTransactions?.length) {
      otherTransactions.forEach(transaction => otherTransactionSources.push(new TransactionSource(transaction.name, toNumberOrUndefined(transaction.amount), transaction.schedule, false, true)));
    }

    return new OtherTransaction(true, otherTransactionSources);
  }
}
