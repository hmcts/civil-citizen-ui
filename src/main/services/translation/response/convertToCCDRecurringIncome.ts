import {CCDIncomeType, CCDRecurringIncome} from "models/ccdResponse/ccdRecurringIncome";
import {ResponseType} from "form/models/responseType";
import {Claim} from "models/claim";
import {RegularIncome} from "form/models/statementOfMeans/expensesAndIncome/regularIncome";
import {CCDPaymentFrequency} from "models/ccdResponse/ccdDebtDetails";
import {TransactionSchedule} from "form/models/statementOfMeans/expensesAndIncome/transactionSchedule";
import {TransactionSource} from "form/models/statementOfMeans/expensesAndIncome/transactionSource";

export const toCCDRecurringIncomeField = (claim: Claim, responseType: ResponseType): CCDRecurringIncome[] => {
  if (claim.respondent1?.responseType === responseType) {
    return toCCDRecurringIncomeList(claim.statementOfMeans?.regularIncome);
  }
  return undefined;
}

const toCCDRecurringIncomeList = (regularIncome: RegularIncome): CCDRecurringIncome[] => {
  if (!regularIncome?.job &&
    !regularIncome?.universalCredit &&
    !regularIncome?.jobseekerAllowanceIncome &&
    !regularIncome?.jobseekerAllowanceContribution &&
    !regularIncome?.incomeSupport &&
    !regularIncome?.workingTaxCredit &&
    !regularIncome?.childTaxCredit &&
    !regularIncome?.childBenefit &&
    !regularIncome?.councilTaxSupport &&
    !regularIncome?.pension &&
    !regularIncome?.other
  ) return undefined;

  const ccdRecurringIncomeList: CCDRecurringIncome[] = [];
  if (regularIncome?.job?.declared) {
    ccdRecurringIncomeList.push(toCCDRecurringIncomeItem(regularIncome?.job?.transactionSource, CCDIncomeType.JOB))
  }
  if (regularIncome?.universalCredit?.declared) {
    ccdRecurringIncomeList.push(toCCDRecurringIncomeItem(regularIncome?.universalCredit?.transactionSource, CCDIncomeType.UNIVERSAL_CREDIT))
  }
  if (regularIncome?.jobseekerAllowanceIncome?.declared) {
    ccdRecurringIncomeList.push(toCCDRecurringIncomeItem(regularIncome?.jobseekerAllowanceIncome?.transactionSource, CCDIncomeType.JOBSEEKER_ALLOWANCE_INCOME))
  }
  if (regularIncome?.jobseekerAllowanceContribution?.declared) {
    ccdRecurringIncomeList.push(toCCDRecurringIncomeItem(regularIncome?.jobseekerAllowanceContribution?.transactionSource, CCDIncomeType.JOBSEEKER_ALLOWANCE_CONTRIBUTION))
  }
  if (regularIncome?.incomeSupport?.declared) {
    ccdRecurringIncomeList.push(toCCDRecurringIncomeItem(regularIncome?.incomeSupport?.transactionSource, CCDIncomeType.INCOME_SUPPORT))
  }
  if (regularIncome?.workingTaxCredit?.declared) {
    ccdRecurringIncomeList.push(toCCDRecurringIncomeItem(regularIncome?.workingTaxCredit?.transactionSource, CCDIncomeType.WORKING_TAX_CREDIT))
  }
  if (regularIncome?.childTaxCredit?.declared) {
    ccdRecurringIncomeList.push(toCCDRecurringIncomeItem(regularIncome?.childTaxCredit?.transactionSource, CCDIncomeType.CHILD_TAX))
  }
  if (regularIncome?.childBenefit?.declared) {
    ccdRecurringIncomeList.push(toCCDRecurringIncomeItem(regularIncome?.childBenefit?.transactionSource, CCDIncomeType.CHILD_BENEFIT))
  }
  if (regularIncome?.councilTaxSupport?.declared) {
    ccdRecurringIncomeList.push(toCCDRecurringIncomeItem(regularIncome?.councilTaxSupport?.transactionSource, CCDIncomeType.COUNCIL_TAX_SUPPORT))
  }
  if (regularIncome?.pension?.declared) {
    ccdRecurringIncomeList.push(toCCDRecurringIncomeItem(regularIncome?.pension?.transactionSource, CCDIncomeType.PENSION))
  }
  if (regularIncome?.other?.declared) {
    ccdRecurringIncomeList.concat(toCCDRecurringIncomeOtherItem(regularIncome?.other?.transactionSources, CCDIncomeType.OTHER))
  }

  return ccdRecurringIncomeList
}

const toCCDRecurringIncomeItem = (transactionSource: TransactionSource, incomeType: CCDIncomeType): CCDRecurringIncome => {
  const ccdRecurringIncome: CCDRecurringIncome = {
      type: incomeType,
      amount: transactionSource?.amount,
      frequency: toCCDPaymentFrequency(transactionSource?.schedule),
  };
  return ccdRecurringIncome;
}

const toCCDRecurringIncomeOtherItem = (otherTransactions: TransactionSource[], incomeType: CCDIncomeType): CCDRecurringIncome[] => {
  if (!otherTransactions?.length || otherTransactions?.length <= 0) return undefined;
  const ccdOtherRecurringIncomeList: CCDRecurringIncome[] = [];
  otherTransactions.forEach((otherTransactionItem, index) => {
    ccdOtherRecurringIncomeList.push(toCCDRecurringIncomeItem(otherTransactionItem, incomeType));
  });
  return ccdOtherRecurringIncomeList;
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

