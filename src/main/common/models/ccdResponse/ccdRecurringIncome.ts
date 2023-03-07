import {CCDPaymentFrequency} from 'models/ccdResponse/ccdPaymentFrequency';

export interface CCDRecurringIncome {
  id?: string,
  value?: CCDRecurringIncomeItem,
}

export interface CCDRecurringIncomeItem {
  type?: CCDIncomeType,
  typeOtherDetails?: string,
  amount?: number,
  frequency?: CCDPaymentFrequency
}

export enum CCDIncomeType {
  JOB = 'JOB',
  UNIVERSAL_CREDIT = 'UNIVERSAL_CREDIT',
  JOBSEEKER_ALLOWANCE_INCOME = 'JOBSEEKER_ALLOWANCE_INCOME',
  JOBSEEKER_ALLOWANCE_CONTRIBUTION = 'JOBSEEKER_ALLOWANCE_CONTRIBUTION',
  INCOME_SUPPORT = 'INCOME_SUPPORT',
  WORKING_TAX_CREDIT = 'WORKING_TAX_CREDIT',
  CHILD_TAX = 'CHILD_TAX',
  CHILD_BENEFIT = 'CHILD_BENEFIT',
  COUNCIL_TAX_SUPPORT = 'COUNCIL_TAX_SUPPORT',
  PENSION = 'PENSION',
  OTHER = 'OTHER',
}
