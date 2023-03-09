import {TransactionSchedule} from 'form/models/statementOfMeans/expensesAndIncome/transactionSchedule';
import {CCDPaymentFrequency} from 'models/ccdResponse/ccdPaymentFrequency';

export const toCCDPaymentFrequency = (schedule: TransactionSchedule): CCDPaymentFrequency => {
  switch (schedule) {
    case TransactionSchedule.WEEK:
      return CCDPaymentFrequency.ONCE_ONE_WEEK;
    case TransactionSchedule.TWO_WEEKS:
      return CCDPaymentFrequency.ONCE_TWO_WEEKS;
    case TransactionSchedule.FOUR_WEEKS:
      return CCDPaymentFrequency.ONCE_FOUR_WEEKS;
    case TransactionSchedule.MONTH:
      return CCDPaymentFrequency.ONCE_ONE_MONTH;
    default:
      return undefined;
  }
};
