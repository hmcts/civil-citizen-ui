import {PriorityDebts} from "form/models/statementOfMeans/priorityDebts";
import {
  CCDDebtDetails,
  CCDDebtDetailsList,
  CCDDebtType,
  CCDPaymentFrequency
} from "models/ccdResponse/ccdDebtDetails";
import {Transaction} from "form/models/statementOfMeans/expensesAndIncome/transaction";
import {TransactionSchedule} from "form/models/statementOfMeans/expensesAndIncome/transactionSchedule";

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
    ccdDebtDetailsList.push(toCCDDebtDetailsItem(priorityDebts?.mortgage, CCDDebtType.MORTGAGE));
  }
  if (priorityDebts?.rent?.declared) {
    ccdDebtDetailsList.push(toCCDDebtDetailsItem(priorityDebts?.rent, CCDDebtType.RENT));
  }
  if (priorityDebts?.councilTax?.declared) {
    ccdDebtDetailsList.push(toCCDDebtDetailsItem(priorityDebts?.councilTax, CCDDebtType.COUNCIL_TAX));
  }
  if (priorityDebts?.gas?.declared) {
    ccdDebtDetailsList.push(toCCDDebtDetailsItem(priorityDebts?.gas, CCDDebtType.GAS));
  }
  if (priorityDebts?.electricity?.declared) {
    ccdDebtDetailsList.push(toCCDDebtDetailsItem(priorityDebts?.electricity, CCDDebtType.ELECTRICITY));
  }
  if (priorityDebts?.water?.declared) {
    ccdDebtDetailsList.push(toCCDDebtDetailsItem(priorityDebts?.water, CCDDebtType.WATER));
  }
  if (priorityDebts?.maintenance?.declared) {
    ccdDebtDetailsList.push(toCCDDebtDetailsItem(priorityDebts?.maintenance, CCDDebtType.MAINTENANCE_PAYMENTS));
  }

  return {
    debtDetails: ccdDebtDetailsList
  };
}

const toCCDDebtDetailsItem = (transaction: Transaction, debtType: CCDDebtType): CCDDebtDetailsList => {
  const ccdDebtDetails: CCDDebtDetailsList = {
    value: {
      debtType: debtType,
      paymentAmount: transaction?.transactionSource?.amount,
      paymentFrequency: toCCDPaymentFrequency(transaction?.transactionSource.schedule),
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
