import {CCDExpensesType, CCDRecurringExpenses} from 'models/ccdResponse/ccdRecurringExpenses';
import {RegularExpenses} from 'form/models/statementOfMeans/expensesAndIncome/regularExpenses';
import {TransactionSource} from 'form/models/statementOfMeans/expensesAndIncome/transactionSource';
import {OtherTransaction} from 'form/models/statementOfMeans/expensesAndIncome/otherTransaction';
import {Transaction} from 'form/models/statementOfMeans/expensesAndIncome/transaction';
import {ExpenseType} from 'form/models/statementOfMeans/expensesAndIncome/expenseType';
import {toCUIPaymentFrequency} from 'services/translation/convertToCUI/convertToCUIPaymentFrequency';

export const toCUIRecurringExpense = (recurringExpensesItemsPA: CCDRecurringExpenses[], recurringExpensesItemsFA: CCDRecurringExpenses[]): RegularExpenses => {
  if (!recurringExpensesItemsPA?.length && !recurringExpensesItemsFA?.length) return undefined;

  if (recurringExpensesItemsPA?.length) {
    return toCUIRecurringExpenseItems(recurringExpensesItemsPA);
  }

  if (recurringExpensesItemsFA?.length) {
    return toCUIRecurringExpenseItems(recurringExpensesItemsFA);
  }
};

const toCUIRecurringExpenseItems = (recurringExpensesItems: CCDRecurringExpenses[]): RegularExpenses => {
  const regularExpenses = RegularExpenses.buildEmptyForm();
  const otherTransactionSources: TransactionSource[] = [];
  recurringExpensesItems.forEach((recurringExpenses: CCDRecurringExpenses) => {
    switch(recurringExpenses?.value?.type) {
      case(CCDExpensesType.MORTGAGE):
        regularExpenses.mortgage = toCUIRecurringExpenseItem(recurringExpenses, ExpenseType.MORTGAGE);
        break;
      case(CCDExpensesType.RENT):
        regularExpenses.rent = toCUIRecurringExpenseItem(recurringExpenses, ExpenseType.RENT);
        break;
      case(CCDExpensesType.COUNCIL_TAX):
        regularExpenses.councilTax = toCUIRecurringExpenseItem(recurringExpenses, ExpenseType.COUNCIL_TAX);
        break;
      case(CCDExpensesType.GAS):
        regularExpenses.gas = toCUIRecurringExpenseItem(recurringExpenses, ExpenseType.GAS);
        break;
      case(CCDExpensesType.ELECTRICITY):
        regularExpenses.electricity = toCUIRecurringExpenseItem(recurringExpenses, ExpenseType.ELECTRICITY);
        break;
      case(CCDExpensesType.WATER):
        regularExpenses.water = toCUIRecurringExpenseItem(recurringExpenses, ExpenseType.WATER);
        break;
      case(CCDExpensesType.TRAVEL):
        regularExpenses.travel = toCUIRecurringExpenseItem(recurringExpenses, ExpenseType.TRAVEL);
        break;
      case(CCDExpensesType.SCHOOL):
        regularExpenses.schoolCosts = toCUIRecurringExpenseItem(recurringExpenses, ExpenseType.SCHOOL_COSTS);
        break;
      case(CCDExpensesType.FOOD):
        regularExpenses.foodAndHousekeeping = toCUIRecurringExpenseItem(recurringExpenses, ExpenseType.FOOD_HOUSEKEEPING);
        break;
      case(CCDExpensesType.TV):
        regularExpenses.tvAndBroadband = toCUIRecurringExpenseItem(recurringExpenses, ExpenseType.TV_AND_BROADBAND);
        break;
      case(CCDExpensesType.HIRE_PURCHASE):
        regularExpenses.hirePurchase = toCUIRecurringExpenseItem(recurringExpenses, ExpenseType.HIRE_PURCHASES);
        break;
      case(CCDExpensesType.MOBILE_PHONE):
        regularExpenses.mobilePhone = toCUIRecurringExpenseItem(recurringExpenses, ExpenseType.MOBILE_PHONE);
        break;
      case(CCDExpensesType.MAINTENANCE):
        regularExpenses.maintenance = toCUIRecurringExpenseItem(recurringExpenses, ExpenseType.MAINTENANCE_PAYMENTS);
        break;
      case(CCDExpensesType.OTHER):
        otherTransactionSources.push(toCUIOtherTransaction(recurringExpenses));
        regularExpenses.other = new OtherTransaction(true, otherTransactionSources);
    }
  });
  return regularExpenses;
};

const toCUIRecurringExpenseItem = (ccdRecurringIncome: CCDRecurringExpenses, expenseType: ExpenseType): Transaction => {
  return Transaction.buildPopulatedForm(
    expenseType,
    ccdRecurringIncome.value?.amount?.toString(),
    toCUIPaymentFrequency(ccdRecurringIncome?.value?.frequency),
    false,
  );
};

const toCUIOtherTransaction = (recurringExpenses: CCDRecurringExpenses) : TransactionSource => {
  return new TransactionSource({
    name: recurringExpenses?.value?.typeOtherDetails,
    isIncome: false,
    amount:recurringExpenses?.value?.amount,
    schedule: toCUIPaymentFrequency(recurringExpenses?.value?.frequency),
    nameRequired: true,
  },
  );
};
