import {CCDIncomeType, CCDRecurringIncome} from 'models/ccdResponse/ccdRecurringIncome';
import {RegularIncome} from 'form/models/statementOfMeans/expensesAndIncome/regularIncome';
import {Transaction} from 'form/models/statementOfMeans/expensesAndIncome/transaction';
import {
  OtherTransaction,
} from 'form/models/statementOfMeans/expensesAndIncome/otherTransaction';
import {IncomeType} from 'form/models/statementOfMeans/expensesAndIncome/incomeType';
import {TransactionSource} from 'form/models/statementOfMeans/expensesAndIncome/transactionSource';
import {toCUIPaymentFrequency} from 'services/translation/convertToCUI/convertToCUIPaymentFrequency';
import {convertToPound, convertToPoundInStringFormat} from 'services/translation/claim/moneyConversation';

export const toCUIRecurringIncome = (recurringIncomeItems: CCDRecurringIncome[]): RegularIncome => {
  if (recurringIncomeItems?.length) return toCUIRecurringIncomeItems(recurringIncomeItems);
};

const toCUIRecurringIncomeItems = (recurringIncomeItems: CCDRecurringIncome[]): RegularIncome => {
  const regularIncome = RegularIncome.buildEmptyForm();
  const otherTransactionSources: TransactionSource[] = [];
  recurringIncomeItems.forEach((recurringIncome: CCDRecurringIncome) => {
    switch(recurringIncome.value?.type) {
      case(CCDIncomeType.JOB):
        regularIncome.job = toCUIRecurringIncomeItem(recurringIncome, IncomeType.JOB);
        break;
      case(CCDIncomeType.UNIVERSAL_CREDIT):
        regularIncome.universalCredit = toCUIRecurringIncomeItem(recurringIncome, IncomeType.UNIVERSAL_CREDIT);
        break;
      case(CCDIncomeType.JOBSEEKER_ALLOWANCE_INCOME):
        regularIncome.jobseekerAllowanceIncome = toCUIRecurringIncomeItem(recurringIncome, IncomeType.JOB_SEEKERS_ALLOWANCE_INCOME_BASED);
        break;
      case(CCDIncomeType.JOBSEEKER_ALLOWANCE_CONTRIBUTION):
        regularIncome.jobseekerAllowanceContribution = toCUIRecurringIncomeItem(recurringIncome, IncomeType.JOB_SEEKERS_ALLOWANCE_CONTRIBUTION_BASED);
        break;
      case(CCDIncomeType.INCOME_SUPPORT):
        regularIncome.incomeSupport = toCUIRecurringIncomeItem(recurringIncome, IncomeType.INCOME_SUPPORT);
        break;
      case(CCDIncomeType.WORKING_TAX_CREDIT):
        regularIncome.workingTaxCredit = toCUIRecurringIncomeItem(recurringIncome, IncomeType.WORKING_TAX_CREDIT);
        break;
      case(CCDIncomeType.CHILD_TAX):
        regularIncome.childTaxCredit = toCUIRecurringIncomeItem(recurringIncome, IncomeType.CHILD_TAX_CREDIT);
        break;
      case(CCDIncomeType.CHILD_BENEFIT):
        regularIncome.childBenefit = toCUIRecurringIncomeItem(recurringIncome, IncomeType.CHILD_BENEFIT);
        break;
      case(CCDIncomeType.COUNCIL_TAX_SUPPORT):
        regularIncome.councilTaxSupport = toCUIRecurringIncomeItem(recurringIncome, IncomeType.COUNCIL_TAX_SUPPORT);
        break;
      case(CCDIncomeType.PENSION):
        regularIncome.pension = toCUIRecurringIncomeItem(recurringIncome, IncomeType.PENSION);
        break;
      case(CCDIncomeType.OTHER):
        otherTransactionSources.push(toCUIOtherTransaction(recurringIncome));
        regularIncome.other = new OtherTransaction(true, otherTransactionSources);
    }
  });
  return regularIncome;
};

const toCUIRecurringIncomeItem = (ccdRecurringIncome: CCDRecurringIncome, incomeType: IncomeType): Transaction => {
  return Transaction.buildPopulatedForm(
    incomeType,
    convertToPoundInStringFormat(ccdRecurringIncome.value.amount),
    toCUIPaymentFrequency(ccdRecurringIncome.value.frequency),
    true,
  );
};

const toCUIOtherTransaction = (recurringIncome: CCDRecurringIncome) : TransactionSource => {
  return  new TransactionSource({
    name: recurringIncome.value.typeOtherDetails,
    isIncome: true,
    amount: convertToPound(recurringIncome.value.amount),
    schedule: toCUIPaymentFrequency(recurringIncome.value.frequency),
    nameRequired: true,
  },
  );
};
