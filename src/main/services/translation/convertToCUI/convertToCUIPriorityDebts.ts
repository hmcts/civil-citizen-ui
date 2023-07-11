import {PriorityDebts} from 'form/models/statementOfMeans/priorityDebts';
import {CCDDebtDetails, CCDDebtDetailsList, CCDDebtType} from 'models/ccdResponse/ccdDebtDetails';
import {Transaction} from 'form/models/statementOfMeans/expensesAndIncome/transaction';
import {ExpenseType} from 'form/models/statementOfMeans/expensesAndIncome/expenseType';
import {toCUIPaymentFrequency} from 'services/translation/convertToCUI/convertToCUIPaymentFrequency';
import {convertToPoundInStringFormat} from 'services/translation/claim/moneyConversation';

export const toCUIPriorityDebts = (priorityDebts: CCDDebtDetails): PriorityDebts => {
  if (priorityDebts) return new PriorityDebts(toCUIPriorityDebtsList(priorityDebts.debtDetails));
};

const toCUIPriorityDebtsList = (priorityDebtsItems: CCDDebtDetailsList[]) : PriorityDebts => {
  if (priorityDebtsItems?.length) {
    const priorityDebts = PriorityDebts.buildEmptyForm();
    priorityDebtsItems.forEach((ccdPriorityDebts: CCDDebtDetailsList) => {
      switch(ccdPriorityDebts.value?.debtType) {
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
  }
};

const toCUIPriorityDebtsItem = (ccdPriorityDebts: CCDDebtDetailsList, expenseType: ExpenseType): Transaction => {
  return Transaction.buildPopulatedForm(
    expenseType,
    convertToPoundInStringFormat(ccdPriorityDebts.value.paymentAmount),
    toCUIPaymentFrequency(ccdPriorityDebts.value.paymentFrequency),
  );
};
