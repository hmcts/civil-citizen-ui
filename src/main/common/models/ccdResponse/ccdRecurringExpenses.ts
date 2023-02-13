import {CCDPaymentFrequency} from "models/ccdResponse/ccdDebtDetails";

export interface CCDRecurringExpenses {
  id?: string,
  value?: CCDRecurringExpensesItem,
}

export interface CCDRecurringExpensesItem {
  type?: CCDExpensesType,
  typeOtherDetails?: string,
  amount?: number,
  frequency?: CCDPaymentFrequency
}

export enum CCDExpensesType {
  MORTGAGE = 'MORTGAGE',
  RENT = 'RENT',
  COUNCIL_TAX = 'COUNCIL_TAX',
  GAS = 'GAS',
  ELECTRICITY = 'ELECTRICITY',
  WATER = 'WATER',
  TRAVEL = 'TRAVEL',
  SCHOOL = 'SCHOOL',
  FOOD = 'FOOD',
  TV = 'TV',
  HIRE_PURCHASE = 'HIRE_PURCHASE',
  MOBILE_PHONE = 'MOBILE_PHONE',
  MAINTENANCE = 'MAINTENANCE',
  OTHER = 'OTHER',
}
