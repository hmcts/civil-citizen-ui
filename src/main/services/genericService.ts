import {BankAccountTypeValues} from '../common/form/models/bankAndSavings/bankAccountTypeValues';
import {t} from 'i18next';

const translateAccountType = (accountType: string, lng: string): string => {
  switch (accountType) {
    case BankAccountTypeValues.CURRENT_ACCOUNT:
      return t('PAGES.CITIZEN_BANK_ACCOUNTS.CURRENT_ACCOUNT', {lng});
    case BankAccountTypeValues.SAVINGS_ACCOUNT:
      return t('PAGES.CITIZEN_BANK_ACCOUNTS.SAVINGS_ACCOUNT', {lng});
    case BankAccountTypeValues.ISA:
      return t('PAGES.CITIZEN_BANK_ACCOUNTS.ISA', {lng});
    case BankAccountTypeValues.OTHER:
      return t('PAGES.CITIZEN_BANK_ACCOUNTS.OTHER', {lng});
    default:
      return '';
  }
};

const translateResidenceType = (residence: string, lng: string): string => {
  switch (residence) {
    case 'COUNCIL_OR_HOUSING_ASSN_HOME':
      return t('PAGES.RESIDENCE.ASSOCIATION_HOME', {lng});
    case 'JOINT_OWN_HOME':
      return t('PAGES.RESIDENCE.JOIN_HOME', {lng});
    case 'OWN_HOME':
      return t('PAGES.RESIDENCE.OWN_HOME', {lng});
    case 'PRIVATE_RENTAL':
      return t('PAGES.RESIDENCE.RENTAL_HOME', {lng});
    default:
      return residence;
  }
};

const translatePriorityDebt = (debt: string, lng: string): string => {
  switch (debt) {
    case 'councilTax':
      return t('COMMON.CHECKBOX_FIELDS.COUNCIL_TAX_AND_COMMUNITY_CHARGE', {lng});
    case 'electricity':
      return t('COMMON.CHECKBOX_FIELDS.ELECTRICITY', {lng});
    case 'gas':
      return t('COMMON.CHECKBOX_FIELDS.GAS', {lng});
    case 'maintenance':
      return t('COMMON.CHECKBOX_FIELDS.MAINTENANCE', {lng});
    case 'mortgage':
      return t('COMMON.CHECKBOX_FIELDS.MORTGAGE', {lng});
    case 'rent':
      return t('COMMON.CHECKBOX_FIELDS.RENT', {lng});
    case 'water':
      return t('COMMON.CHECKBOX_FIELDS.WATER', {lng});
    default:
      return debt;
  }
};

const translateRepaymentSchedule = (schedule: string, lng: string): string => {
  switch (schedule) {
    case 'FOUR_WEEKS':
      return t('COMMON.PAYMENT_SCHEDULE.FOUR_WEEKLY', {lng});
    case 'MONTH':
      return t('COMMON.PAYMENT_SCHEDULE.MONTHLY', {lng});
    case 'TWO_WEEKS':
      return t('COMMON.PAYMENT_SCHEDULE.BI_WEEKLY', {lng});
    case 'WEEK':
      return t('COMMON.PAYMENT_SCHEDULE.WEEKLY', {lng});
    default:
      return schedule;
  }
};

const exhaustiveMatchingGuard = (p: never): never => {
  throw new Error(`Non-exhaustive switch ${p}`);
};

export {
  translateAccountType,
  translatePriorityDebt,
  translateRepaymentSchedule,
  translateResidenceType,
  exhaustiveMatchingGuard,
};
