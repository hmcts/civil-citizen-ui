import TransactionSource from './transactionSource';
import {ValidateIf, ValidateNested} from 'class-validator';
import {TransactionSchedule} from './transactionSchedule';
import {toNumberOrUndefined} from '../../../../utils/numberConverter';

export default class Transaction {
  declared: boolean;

  @ValidateIf((o: Transaction) => o.declared === true)
  @ValidateNested()
    transactionSource: TransactionSource;

  constructor(declared?: boolean, transactionSource?: TransactionSource) {
    this.declared = declared;
    this.transactionSource = transactionSource;
  }

  public static buildEmptyForm(type: string, income?: boolean): Transaction {
    return new Transaction(undefined, new TransactionSource({name: type, isIncome: income}));
  }

  public static buildPopulatedForm(name: string, amount?: string, schedule?: TransactionSchedule, income?: boolean): Transaction {
    return new Transaction(true, new TransactionSource({
      name: name,
      amount: toNumberOrUndefined(amount),
      schedule: schedule,
      isIncome: income,
    }));
  }
}
