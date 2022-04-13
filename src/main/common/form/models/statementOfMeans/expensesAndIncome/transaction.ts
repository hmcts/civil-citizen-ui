import TransactionSource from './transactionSource';
import {ValidateIf, ValidateNested} from 'class-validator';
import {TransactionSchedule} from './transactionSchedule';
import {toNumberOrUndefined} from '../../../../utils/numberConverter';

export default class Transaction {
  declared: boolean;

  @ValidateIf((o: Transaction) => o.declared === true)
  @ValidateNested()
    expenseSource: TransactionSource;

  constructor(declared?: boolean, expenseSource?: TransactionSource) {
    this.declared = declared;
    this.expenseSource = expenseSource;
  }

  public static buildEmptyForm(type: string): Transaction {
    return new Transaction(undefined, new TransactionSource(type));
  }

  public static buildPopulatedForm(name: string, amount: string, schedule: TransactionSchedule): Transaction {
    return new Transaction(true, new TransactionSource(name, toNumberOrUndefined(amount), schedule));
  }
}
