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

  static buildEmptyForm(isIncome: boolean): OtherTransaction {
    return new OtherTransaction(false, [new TransactionSource({isIncome: isIncome})]);
  }

  static buildPopulatedForm(otherTransactions: OtherTransactionRequestParams[], income: boolean): OtherTransaction {
    const otherTransactionSources: TransactionSource[] = [];
    if (otherTransactions?.length) {
      otherTransactions.forEach(transaction => otherTransactionSources.push(new TransactionSource({
        name: transaction.name,
        amount: toNumberOrUndefined(transaction.amount),
        schedule: transaction.schedule,
        isIncome: income,
        nameRequired: true,
      })));
    }

    return new OtherTransaction(true, otherTransactionSources);
  }
}
