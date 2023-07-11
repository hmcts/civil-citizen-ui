import {PriorityDebts} from 'form/models/statementOfMeans/priorityDebts';
import {
  CCDDebtDetails,
  CCDDebtDetailsList,
  CCDDebtType,
} from 'models/ccdResponse/ccdDebtDetails';
import {TransactionSource} from 'form/models/statementOfMeans/expensesAndIncome/transactionSource';
import {toCCDPaymentFrequency} from 'services/translation/response/convertToCCDPaymentFrequency';
import {convertToPence} from 'services/translation/claim/moneyConversation';

export const toCCDDebtDetails = (priorityDebts: PriorityDebts): CCDDebtDetails => {
  if (!priorityDebts) return undefined;

  if (isPriorityDebtsNotDeclared(priorityDebts)) return undefined;

  const ccdDebtDetailsList: CCDDebtDetailsList[] = [];
  if (priorityDebts.mortgage.declared) {
    ccdDebtDetailsList.push(toCCDDebtDetailsItem(priorityDebts.mortgage.transactionSource, CCDDebtType.MORTGAGE));
  }
  if (priorityDebts.rent.declared) {
    ccdDebtDetailsList.push(toCCDDebtDetailsItem(priorityDebts.rent.transactionSource, CCDDebtType.RENT));
  }
  if (priorityDebts.councilTax.declared) {
    ccdDebtDetailsList.push(toCCDDebtDetailsItem(priorityDebts.councilTax.transactionSource, CCDDebtType.COUNCIL_TAX));
  }
  if (priorityDebts.gas.declared) {
    ccdDebtDetailsList.push(toCCDDebtDetailsItem(priorityDebts.gas.transactionSource, CCDDebtType.GAS));
  }
  if (priorityDebts.electricity.declared) {
    ccdDebtDetailsList.push(toCCDDebtDetailsItem(priorityDebts.electricity.transactionSource, CCDDebtType.ELECTRICITY));
  }
  if (priorityDebts.water.declared) {
    ccdDebtDetailsList.push(toCCDDebtDetailsItem(priorityDebts.water.transactionSource, CCDDebtType.WATER));
  }
  if (priorityDebts.maintenance.declared) {
    ccdDebtDetailsList.push(toCCDDebtDetailsItem(priorityDebts.maintenance.transactionSource, CCDDebtType.MAINTENANCE_PAYMENTS));
  }

  return {
    debtDetails: ccdDebtDetailsList,
  };
};

const toCCDDebtDetailsItem = (transactionSource: TransactionSource, debtType: CCDDebtType): CCDDebtDetailsList => {
  const ccdDebtDetails: CCDDebtDetailsList = {
    value: {
      debtType: debtType,
      paymentAmount: convertToPence(transactionSource?.amount),
      paymentFrequency: toCCDPaymentFrequency(transactionSource?.schedule),
    },
  };
  return ccdDebtDetails;
};

const isPriorityDebtsNotDeclared = (priorityDebts: PriorityDebts): boolean => {
  return (!priorityDebts.mortgage?.declared &&
    !priorityDebts.rent?.declared &&
    !priorityDebts.councilTax?.declared &&
    !priorityDebts.gas?.declared &&
    !priorityDebts.electricity?.declared &&
    !priorityDebts.water?.declared &&
    !priorityDebts.maintenance?.declared
  );
};
