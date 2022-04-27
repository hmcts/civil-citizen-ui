import {TransactionSchedule} from '../../form/models/statementOfMeans/expensesAndIncome/transactionSchedule';

export class AmountSchedule {
  static readonly WEEK = new AmountSchedule(TransactionSchedule.WEEK, 52 / 12);
  static readonly TWO_WEEKS = new AmountSchedule(TransactionSchedule.TWO_WEEKS, 52 / 12 / 2);
  static readonly FOUR_WEEKS = new AmountSchedule(TransactionSchedule.FOUR_WEEKS, 52 / 12 / 4);
  static readonly MONTH = new AmountSchedule(TransactionSchedule.MONTH, 1);
  name: string;
  valueInMonth: number;

  constructor(name: TransactionSchedule, valueInMonth: number) {
    this.name = name;
    this.valueInMonth = valueInMonth;
  }

  public static getAll(): AmountSchedule[] {
    return [
      AmountSchedule.WEEK,
      AmountSchedule.TWO_WEEKS,
      AmountSchedule.FOUR_WEEKS,
      AmountSchedule.MONTH,
    ];
  }

  public static getSchedule(name: string): AmountSchedule | undefined {
    return AmountSchedule.getAll().find(schedule => schedule.name === name);
  }
}
