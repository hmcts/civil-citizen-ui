import {ResponseType} from 'form/models/responseType';
import {Claim} from 'models/claim';
import {RegularExpenses} from 'form/models/statementOfMeans/expensesAndIncome/regularExpenses';
import {TransactionSource} from 'form/models/statementOfMeans/expensesAndIncome/transactionSource';
import {CCDExpensesType, CCDRecurringExpenses} from 'models/ccdResponse/ccdRecurringExpenses';
import {toCCDPaymentFrequency} from 'services/translation/response/convertToCCDPaymentFrequency';
import {convertToPence} from 'services/translation/claim/moneyConversation';

export const toCCDRecurringExpensesField = (claim: Claim, responseType: ResponseType): CCDRecurringExpenses[] => {
  if (claim.respondent1?.responseType === responseType) {
    return toCCDRecurringExpensesList(claim.statementOfMeans?.regularExpenses);
  }
};

const toCCDRecurringExpensesList = (regularExpenses: RegularExpenses): CCDRecurringExpenses[] => {
  if (!regularExpenses) return undefined;

  if (isRecurringExpensesNotDeclared(regularExpenses)) return undefined;

  let ccdRecurringExpensesList: CCDRecurringExpenses[] = [];
  if (regularExpenses.mortgage.declared) {
    ccdRecurringExpensesList.push(toCCDRecurringExpensesItem(regularExpenses.mortgage.transactionSource, CCDExpensesType.MORTGAGE));
  }
  if (regularExpenses.rent.declared) {
    ccdRecurringExpensesList.push(toCCDRecurringExpensesItem(regularExpenses.rent.transactionSource, CCDExpensesType.RENT));
  }
  if (regularExpenses.councilTax.declared) {
    ccdRecurringExpensesList.push(toCCDRecurringExpensesItem(regularExpenses.councilTax.transactionSource, CCDExpensesType.COUNCIL_TAX));
  }
  if (regularExpenses.gas.declared) {
    ccdRecurringExpensesList.push(toCCDRecurringExpensesItem(regularExpenses.gas.transactionSource, CCDExpensesType.GAS));
  }
  if (regularExpenses.electricity.declared) {
    ccdRecurringExpensesList.push(toCCDRecurringExpensesItem(regularExpenses.electricity.transactionSource, CCDExpensesType.ELECTRICITY));
  }
  if (regularExpenses.water.declared) {
    ccdRecurringExpensesList.push(toCCDRecurringExpensesItem(regularExpenses.water.transactionSource, CCDExpensesType.WATER));
  }
  if (regularExpenses.travel.declared) {
    ccdRecurringExpensesList.push(toCCDRecurringExpensesItem(regularExpenses.travel.transactionSource, CCDExpensesType.TRAVEL));
  }
  if (regularExpenses.schoolCosts.declared) {
    ccdRecurringExpensesList.push(toCCDRecurringExpensesItem(regularExpenses.schoolCosts.transactionSource, CCDExpensesType.SCHOOL));
  }
  if (regularExpenses.foodAndHousekeeping.declared) {
    ccdRecurringExpensesList.push(toCCDRecurringExpensesItem(regularExpenses.foodAndHousekeeping.transactionSource, CCDExpensesType.FOOD));
  }
  if (regularExpenses.tvAndBroadband.declared) {
    ccdRecurringExpensesList.push(toCCDRecurringExpensesItem(regularExpenses.tvAndBroadband.transactionSource, CCDExpensesType.TV));
  }
  if (regularExpenses.hirePurchase.declared) {
    ccdRecurringExpensesList.push(toCCDRecurringExpensesItem(regularExpenses.hirePurchase.transactionSource, CCDExpensesType.HIRE_PURCHASE));
  }
  if (regularExpenses.mobilePhone.declared) {
    ccdRecurringExpensesList.push(toCCDRecurringExpensesItem(regularExpenses.mobilePhone.transactionSource, CCDExpensesType.MOBILE_PHONE));
  }
  if (regularExpenses.maintenance.declared) {
    ccdRecurringExpensesList.push(toCCDRecurringExpensesItem(regularExpenses.maintenance.transactionSource, CCDExpensesType.MAINTENANCE));
  }
  if (regularExpenses.other.declared) {
    ccdRecurringExpensesList = ccdRecurringExpensesList.concat(toCCDRecurringExpensesOtherItem(regularExpenses.other.transactionSources, CCDExpensesType.OTHER));
  }

  return ccdRecurringExpensesList;
};

const toCCDRecurringExpensesItem = (transactionSource: TransactionSource, expensesType: CCDExpensesType): CCDRecurringExpenses => {
  const ccdRecurringExpenses: CCDRecurringExpenses = {
    value :{
      type: expensesType,
      amount: convertToPence(transactionSource?.amount),
      frequency: toCCDPaymentFrequency(transactionSource?.schedule),
    },
  };
  return ccdRecurringExpenses;
};

const toCCDRecurringExpensesOtherItem = (otherTransactions: TransactionSource[], expensesType: CCDExpensesType): CCDRecurringExpenses[] => {
  if (!otherTransactions?.length) return undefined;
  const ccdOtherRecurringExpensesList: CCDRecurringExpenses[] = [];
  otherTransactions.forEach((otherTransactionItem) => {
    const ccdRecurringExpenses = toCCDRecurringExpensesItem(otherTransactionItem, expensesType);
    ccdRecurringExpenses.value.typeOtherDetails = otherTransactionItem?.name;
    ccdOtherRecurringExpensesList.push(ccdRecurringExpenses);
  });
  return ccdOtherRecurringExpensesList;
};

const isRecurringExpensesNotDeclared = (regularExpenses: RegularExpenses): boolean => {
  return (!regularExpenses.mortgage?.declared &&
    !regularExpenses.rent?.declared &&
    !regularExpenses.councilTax?.declared &&
    !regularExpenses.gas?.declared &&
    !regularExpenses.electricity?.declared &&
    !regularExpenses.water?.declared &&
    !regularExpenses.travel?.declared &&
    !regularExpenses.schoolCosts?.declared &&
    !regularExpenses.foodAndHousekeeping?.declared &&
    !regularExpenses.tvAndBroadband?.declared &&
    !regularExpenses.hirePurchase?.declared &&
    !regularExpenses.mobilePhone?.declared &&
    !regularExpenses.maintenance?.declared &&
    !regularExpenses.other?.declared
  );
};

