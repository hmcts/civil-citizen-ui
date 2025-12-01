import {CCDIncomeType, CCDRecurringIncome} from 'models/ccdResponse/ccdRecurringIncome';
import {ResponseType} from 'form/models/responseType';
import {Claim} from 'models/claim';
import {RegularIncome} from 'form/models/statementOfMeans/expensesAndIncome/regularIncome';
import {TransactionSource} from 'form/models/statementOfMeans/expensesAndIncome/transactionSource';
import {toCCDPaymentFrequency} from 'services/translation/response/convertToCCDPaymentFrequency';
import {convertToPence} from 'services/translation/claim/moneyConversation';

export const toCCDRecurringIncomeField = (claim: Claim, responseType: ResponseType): CCDRecurringIncome[] => {
  if (claim.respondent1?.responseType === responseType) {
    return toCCDRecurringIncomeList(claim.statementOfMeans?.regularIncome);
  }
};

const toCCDRecurringIncomeList = (regularIncome: RegularIncome): CCDRecurringIncome[] => {
  if (!regularIncome) return undefined;

  if (isRecurringIncomeNotDeclared(regularIncome)) return undefined;

  let ccdRecurringIncomeList: CCDRecurringIncome[] = [];
  if (regularIncome.job?.declared) {
    ccdRecurringIncomeList.push(toCCDRecurringIncomeItem(regularIncome.job.transactionSource, CCDIncomeType.JOB));
  }
  if (regularIncome.universalCredit?.declared) {
    ccdRecurringIncomeList.push(toCCDRecurringIncomeItem(regularIncome.universalCredit.transactionSource, CCDIncomeType.UNIVERSAL_CREDIT));
  }
  if (regularIncome.jobseekerAllowanceIncome?.declared) {
    ccdRecurringIncomeList.push(toCCDRecurringIncomeItem(regularIncome.jobseekerAllowanceIncome.transactionSource, CCDIncomeType.JOBSEEKER_ALLOWANCE_INCOME));
  }
  if (regularIncome.jobseekerAllowanceContribution?.declared) {
    ccdRecurringIncomeList.push(toCCDRecurringIncomeItem(regularIncome.jobseekerAllowanceContribution.transactionSource, CCDIncomeType.JOBSEEKER_ALLOWANCE_CONTRIBUTION));
  }
  if (regularIncome.incomeSupport?.declared) {
    ccdRecurringIncomeList.push(toCCDRecurringIncomeItem(regularIncome.incomeSupport.transactionSource, CCDIncomeType.INCOME_SUPPORT));
  }
  if (regularIncome.workingTaxCredit?.declared) {
    ccdRecurringIncomeList.push(toCCDRecurringIncomeItem(regularIncome.workingTaxCredit.transactionSource, CCDIncomeType.WORKING_TAX_CREDIT));
  }
  if (regularIncome.childTaxCredit?.declared) {
    ccdRecurringIncomeList.push(toCCDRecurringIncomeItem(regularIncome.childTaxCredit.transactionSource, CCDIncomeType.CHILD_TAX));
  }
  if (regularIncome.childBenefit?.declared) {
    ccdRecurringIncomeList.push(toCCDRecurringIncomeItem(regularIncome.childBenefit.transactionSource, CCDIncomeType.CHILD_BENEFIT));
  }
  if (regularIncome.councilTaxSupport?.declared) {
    ccdRecurringIncomeList.push(toCCDRecurringIncomeItem(regularIncome.councilTaxSupport.transactionSource, CCDIncomeType.COUNCIL_TAX_SUPPORT));
  }
  if (regularIncome.pension?.declared) {
    ccdRecurringIncomeList.push(toCCDRecurringIncomeItem(regularIncome.pension.transactionSource, CCDIncomeType.PENSION));
  }
  if (regularIncome.other?.declared) {
    ccdRecurringIncomeList = ccdRecurringIncomeList.concat(toCCDRecurringIncomeOtherItem(regularIncome.other.transactionSources, CCDIncomeType.OTHER));
  }

  return ccdRecurringIncomeList;
};

const toCCDRecurringIncomeItem = (transactionSource: TransactionSource, incomeType: CCDIncomeType): CCDRecurringIncome => {
  const ccdRecurringIncome: CCDRecurringIncome = {
    value :{
      type: incomeType,
      amount: convertToPence(transactionSource?.amount),
      frequency: toCCDPaymentFrequency(transactionSource?.schedule),
    },
  };
  return ccdRecurringIncome;
};

const toCCDRecurringIncomeOtherItem = (otherTransactions: TransactionSource[], incomeType: CCDIncomeType): CCDRecurringIncome[] => {
  if (!otherTransactions?.length) return undefined;
  const ccdOtherRecurringIncomeList: CCDRecurringIncome[] = [];
  otherTransactions.forEach((otherTransactionItem) => {
    const ccdRecurringIncome = toCCDRecurringIncomeItem(otherTransactionItem, incomeType);
    ccdRecurringIncome.value.typeOtherDetails = otherTransactionItem?.name;
    ccdOtherRecurringIncomeList.push(ccdRecurringIncome);
  });
  return ccdOtherRecurringIncomeList;
};

const isRecurringIncomeNotDeclared = (regularIncome: RegularIncome): boolean => {
  return (!regularIncome.job?.declared &&
    !regularIncome.universalCredit?.declared &&
    !regularIncome.jobseekerAllowanceIncome?.declared &&
    !regularIncome.jobseekerAllowanceContribution?.declared &&
    !regularIncome.incomeSupport?.declared &&
    !regularIncome.workingTaxCredit?.declared &&
    !regularIncome.childTaxCredit?.declared &&
    !regularIncome.childBenefit?.declared &&
    !regularIncome.councilTaxSupport?.declared &&
    !regularIncome.pension?.declared &&
    !regularIncome.other?.declared
  );
};

