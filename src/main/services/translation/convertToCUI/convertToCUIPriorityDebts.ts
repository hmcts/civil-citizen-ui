import {PriorityDebts} from 'form/models/statementOfMeans/priorityDebts';
import {CCDDebtDetails, CCDDebtDetailsList, CCDDebtType} from 'models/ccdResponse/ccdDebtDetails';
import {Transaction} from 'form/models/statementOfMeans/expensesAndIncome/transaction';
import {ExpenseType} from 'form/models/statementOfMeans/expensesAndIncome/expenseType';
import {TransactionSchedule} from 'form/models/statementOfMeans/expensesAndIncome/transactionSchedule';
import {CCDPaymentFrequency} from 'models/ccdResponse/ccdPaymentFrequency';

export const toCUIPriorityDebts = (priorityDebts: CCDDebtDetails): PriorityDebts => {
  if (!priorityDebts) return undefined;

  return new PriorityDebts(toCUIPriorityDebtsList(priorityDebts?.debtDetails));
};

export const toCUIPriorityDebtsList = (priorityDebtsItems: CCDDebtDetailsList[]) : PriorityDebts => {
  if (!priorityDebtsItems?.length) return undefined;
  const priorityDebts = PriorityDebts.buildEmptyForm();
  priorityDebtsItems.forEach((ccdPriorityDebts: CCDDebtDetailsList) => {
    switch(ccdPriorityDebts?.value?.debtType) {
      case(CCDDebtType.MORTGAGE):
        priorityDebts.mortgage = toCUIPriorityDebtsItem(ccdPriorityDebts, ExpenseType.MORTGAGE_DEBT);
        break;
      case(CCDDebtType.RENT):
        priorityDebts.rent = toCUIPriorityDebtsItem(ccdPriorityDebts, ExpenseType.RENT_DEBT);
        break;
      case(CCDDebtType.COUNCIL_TAX):
        priorityDebts.councilTax = toCUIPriorityDebtsItem(ccdPriorityDebts, ExpenseType.COUNCIL_TAX_OR_COMMUNITY_CHARGE);
        break;
      case(CCDDebtType.GAS):
        priorityDebts.gas = toCUIPriorityDebtsItem(ccdPriorityDebts, ExpenseType.GAS_DEBT);
        break;
      case(CCDDebtType.ELECTRICITY):
        priorityDebts.electricity = toCUIPriorityDebtsItem(ccdPriorityDebts, ExpenseType.ELECTRICITY_DEBT);
        break;
      case(CCDDebtType.WATER):
        priorityDebts.water = toCUIPriorityDebtsItem(ccdPriorityDebts, ExpenseType.WATER_DEBT);
        break;
      case(CCDDebtType.MAINTENANCE_PAYMENTS):
        priorityDebts.maintenance = toCUIPriorityDebtsItem(ccdPriorityDebts, ExpenseType.MAINTENANCE_PAYMENTS_DEBT);
        break;
    }
  });
  return priorityDebts;
};

export const toCUIPaymentFrequency = (schedule: CCDPaymentFrequency): TransactionSchedule => {
  switch (schedule) {
    case CCDPaymentFrequency.ONCE_ONE_WEEK:
      return  TransactionSchedule.WEEK;
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

export const toCUIPriorityDebtsItem = (ccdPriorityDebts: CCDDebtDetailsList, expenseType: ExpenseType): Transaction => {
  return Transaction.buildPopulatedForm(
    expenseType,
    ccdPriorityDebts?.value?.paymentAmount?.toString(),
    toCUIPaymentFrequency(ccdPriorityDebts?.value?.paymentFrequency),
  );
};
