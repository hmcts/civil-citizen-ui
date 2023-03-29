import {CCDPaymentFrequency} from 'models/ccdResponse/ccdPaymentFrequency';
import {TransactionSchedule} from 'form/models/statementOfMeans/expensesAndIncome/transactionSchedule';

export const toCUIPaymentFrequency = (schedule: CCDPaymentFrequency): TransactionSchedule => {
  switch (schedule) {
    case CCDPaymentFrequency.ONCE_ONE_WEEK:
      return TransactionSchedule.WEEK;
    case CCDPaymentFrequency.ONCE_TWO_WEEKS:
      return TransactionSchedule.TWO_WEEKS;
    case CCDPaymentFrequency.ONCE_FOUR_WEEKS:
      return TransactionSchedule.FOUR_WEEKS;
    case CCDPaymentFrequency.ONCE_ONE_MONTH:
      return TransactionSchedule.MONTH;
    default:
      return undefined;
  }
};
