import {PriorityDebts} from "form/models/statementOfMeans/priorityDebts";
import {
  CCDDebtDetails,
  CCDDebtDetailsList,
  CCDDebtType,
  CCDPaymentFrequency
} from "models/ccdResponse/ccdDebtDetails";
import {TransactionSchedule} from "form/models/statementOfMeans/expensesAndIncome/transactionSchedule";
import {TransactionSource} from "form/models/statementOfMeans/expensesAndIncome/transactionSource";

export const toCCDDebtDetails = (priorityDebts: PriorityDebts): CCDDebtDetails => {
  if (!priorityDebts?.mortgage &&
    !priorityDebts?.rent &&
    !priorityDebts?.councilTax &&
    !priorityDebts?.gas &&
    !priorityDebts?.electricity &&
    !priorityDebts?.water &&
    !priorityDebts?.maintenance
  ) return undefined;

  const ccdDebtDetailsList: CCDDebtDetailsList[] = [];
  if (priorityDebts?.mortgage?.declared) {
    ccdDebtDetailsList.push(toCCDDebtDetailsItem(priorityDebts?.mortgage?.transactionSource, CCDDebtType.MORTGAGE));
  }
  if (priorityDebts?.rent?.declared) {
    ccdDebtDetailsList.push(toCCDDebtDetailsItem(priorityDebts?.rent?.transactionSource, CCDDebtType.RENT));
  }
  if (priorityDebts?.councilTax?.declared) {
    ccdDebtDetailsList.push(toCCDDebtDetailsItem(priorityDebts?.councilTax?.transactionSource, CCDDebtType.COUNCIL_TAX));
  }
  if (priorityDebts?.gas?.declared) {
    ccdDebtDetailsList.push(toCCDDebtDetailsItem(priorityDebts?.gas?.transactionSource, CCDDebtType.GAS));
  }
  if (priorityDebts?.electricity?.declared) {
    ccdDebtDetailsList.push(toCCDDebtDetailsItem(priorityDebts?.electricity?.transactionSource, CCDDebtType.ELECTRICITY));
  }
  if (priorityDebts?.water?.declared) {
    ccdDebtDetailsList.push(toCCDDebtDetailsItem(priorityDebts?.water?.transactionSource, CCDDebtType.WATER));
  }
  if (priorityDebts?.maintenance?.declared) {
    ccdDebtDetailsList.push(toCCDDebtDetailsItem(priorityDebts?.maintenance?.transactionSource, CCDDebtType.MAINTENANCE_PAYMENTS));
  }

  return {
    debtDetails: ccdDebtDetailsList
  };
}

const toCCDDebtDetailsItem = (transactionSource: TransactionSource, debtType: CCDDebtType): CCDDebtDetailsList => {
  const ccdDebtDetails: CCDDebtDetailsList = {
    value: {
      debtType: debtType,
      paymentAmount: transactionSource?.amount,
      paymentFrequency: toCCDPaymentFrequency(transactionSource?.schedule),
    }
  };
  return ccdDebtDetails;
}

const toCCDPaymentFrequency = (schedule: TransactionSchedule): CCDPaymentFrequency => {
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
}
