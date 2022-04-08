import {ScheduledExpenses} from '../../../../../main/common/form/models/statementOfMeans/expenses/scheduledExpenses';

export class AmountSchedule {
  static readonly WEEK = new AmountSchedule(ScheduledExpenses.WEEK, 52 / 12);
  static readonly TWO_WEEKS = new AmountSchedule(ScheduledExpenses.TWO_WEEKS, 52 / 12 / 2);
  static readonly FOUR_WEEKS = new AmountSchedule(ScheduledExpenses.FOUR_WEEKS, 52 / 12 / 4);
  static readonly MONTH = new AmountSchedule('MONTH', 1);
  name: ScheduledExpenses;
  valueInMonth: number;

  constructor(name: ScheduledExpenses, valueInMonth: number) {
    this.name = name;
    this.
  }
}
