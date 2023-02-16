import {ResponseType} from 'form/models/responseType';
import {Claim} from 'models/claim';
import {RegularExpenses} from 'form/models/statementOfMeans/expensesAndIncome/regularExpenses';
import {TransactionSource} from 'form/models/statementOfMeans/expensesAndIncome/transactionSource';
import {CCDExpensesType, CCDRecurringExpenses} from 'models/ccdResponse/ccdRecurringExpenses';
import {toCCDPaymentFrequency} from 'services/translation/response/convertToCCDPaymentFrequency';

export const toCCDRecurringExpensesField = (claim: Claim, responseType: ResponseType): CCDRecurringExpenses[] => {
  if (claim.respondent1?.responseType === responseType) {
    return toCCDRecurringExpensesList(claim.statementOfMeans?.regularExpenses);
  }
  return undefined;
};

const toCCDRecurringExpensesList = (regularExpenses: RegularExpenses): CCDRecurringExpenses[] => {
  if (!regularExpenses?.mortgage &&
    !regularExpenses?.rent &&
    !regularExpenses?.councilTax &&
    !regularExpenses?.gas &&
    !regularExpenses?.electricity &&
    !regularExpenses?.water &&
    !regularExpenses?.travel &&
    !regularExpenses?.schoolCosts &&
    !regularExpenses?.foodAndHousekeeping &&
    !regularExpenses?.tvAndBroadband &&
    !regularExpenses?.hirePurchase &&
    !regularExpenses?.mobilePhone &&
    !regularExpenses?.maintenance &&
    !regularExpenses?.other
  ) return undefined;

  let ccdRecurringExpensesList: CCDRecurringExpenses[] = [];
  if (regularExpenses?.mortgage?.declared) {
    ccdRecurringExpensesList.push(toCCDRecurringExpensesItem(regularExpenses?.mortgage?.transactionSource, CCDExpensesType.MORTGAGE));
  }
  if (regularExpenses?.rent?.declared) {
    ccdRecurringExpensesList.push(toCCDRecurringExpensesItem(regularExpenses?.rent?.transactionSource, CCDExpensesType.RENT));
  }
  if (regularExpenses?.councilTax?.declared) {
    ccdRecurringExpensesList.push(toCCDRecurringExpensesItem(regularExpenses?.councilTax?.transactionSource, CCDExpensesType.COUNCIL_TAX));
  }
  if (regularExpenses?.gas?.declared) {
    ccdRecurringExpensesList.push(toCCDRecurringExpensesItem(regularExpenses?.gas?.transactionSource, CCDExpensesType.GAS));
  }
  if (regularExpenses?.electricity?.declared) {
    ccdRecurringExpensesList.push(toCCDRecurringExpensesItem(regularExpenses?.electricity?.transactionSource, CCDExpensesType.ELECTRICITY));
  }
  if (regularExpenses?.water?.declared) {
    ccdRecurringExpensesList.push(toCCDRecurringExpensesItem(regularExpenses?.water?.transactionSource, CCDExpensesType.WATER));
  }
  if (regularExpenses?.travel?.declared) {
    ccdRecurringExpensesList.push(toCCDRecurringExpensesItem(regularExpenses?.travel?.transactionSource, CCDExpensesType.TRAVEL));
  }
  if (regularExpenses?.schoolCosts?.declared) {
    ccdRecurringExpensesList.push(toCCDRecurringExpensesItem(regularExpenses?.schoolCosts?.transactionSource, CCDExpensesType.SCHOOL));
  }
  if (regularExpenses?.foodAndHousekeeping?.declared) {
    ccdRecurringExpensesList.push(toCCDRecurringExpensesItem(regularExpenses?.foodAndHousekeeping?.transactionSource, CCDExpensesType.FOOD));
  }
  if (regularExpenses?.tvAndBroadband?.declared) {
    ccdRecurringExpensesList.push(toCCDRecurringExpensesItem(regularExpenses?.tvAndBroadband?.transactionSource, CCDExpensesType.TV));
  }
  if (regularExpenses?.hirePurchase?.declared) {
    ccdRecurringExpensesList.push(toCCDRecurringExpensesItem(regularExpenses?.hirePurchase?.transactionSource, CCDExpensesType.HIRE_PURCHASE));
  }
  if (regularExpenses?.mobilePhone?.declared) {
    ccdRecurringExpensesList.push(toCCDRecurringExpensesItem(regularExpenses?.mobilePhone?.transactionSource, CCDExpensesType.MOBILE_PHONE));
  }
  if (regularExpenses?.maintenance?.declared) {
    ccdRecurringExpensesList.push(toCCDRecurringExpensesItem(regularExpenses?.maintenance?.transactionSource, CCDExpensesType.MAINTENANCE));
  }
  if (regularExpenses?.other?.declared) {
    ccdRecurringExpensesList = ccdRecurringExpensesList.concat(toCCDRecurringExpensesOtherItem(regularExpenses?.other?.transactionSources, CCDExpensesType.OTHER));
  }

  return ccdRecurringExpensesList;
};

const toCCDRecurringExpensesItem = (transactionSource: TransactionSource, expensesType: CCDExpensesType): CCDRecurringExpenses => {
  const ccdRecurringExpenses: CCDRecurringExpenses = {
    value :{
      type: expensesType,
      amount: transactionSource?.amount,
      frequency: toCCDPaymentFrequency(transactionSource?.schedule),
    },
  };
  return ccdRecurringExpenses;
};

const toCCDRecurringExpensesOtherItem = (otherTransactions: TransactionSource[], expensesType: CCDExpensesType): CCDRecurringExpenses[] => {
  if (!otherTransactions?.length || otherTransactions?.length <= 0) return undefined;
  const ccdOtherRecurringExpensesList: CCDRecurringExpenses[] = [];
  otherTransactions.forEach((otherTransactionItem, index) => {
    const ccdRecurringExpenses = toCCDRecurringExpensesItem(otherTransactionItem, expensesType);
    ccdRecurringExpenses.value.typeOtherDetails = otherTransactionItem?.name;
    ccdOtherRecurringExpensesList.push(ccdRecurringExpenses);
  });
  return ccdOtherRecurringExpensesList;
};

