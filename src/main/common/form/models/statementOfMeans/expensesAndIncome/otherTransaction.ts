import {ValidateIf, ValidateNested} from 'class-validator';
import {TransactionSource} from './transactionSource';
import {TransactionSchedule} from './transactionSchedule';
import {toNumberOrUndefined} from '../../../../utils/numberConverter';

export interface OtherTransactionRequestParams {
  name?: string;
  amount?: string;
  schedule?: TransactionSchedule;
}

export class OtherTransaction {
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

  static buildPopulatedForm(otherTransactions: OtherTransactionRequestParams[] = [], income: boolean): OtherTransaction {

    const otherTransactionSources: TransactionSource[] = Object.values(otherTransactions)
      .filter(value=> value.name.length > 0)
      .map(value=> new TransactionSource({ name: value.name,
        amount: toNumberOrUndefined(value.amount),
        schedule: value.schedule,
        isIncome: income,
        nameRequired: true}));

    return new OtherTransaction(true, otherTransactionSources);
  }
}
