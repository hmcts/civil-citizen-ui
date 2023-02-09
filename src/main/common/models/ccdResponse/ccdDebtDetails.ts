export interface CCDDebtDetails {
  debtDetails?: CCDDebtDetailsList[],
}

export interface CCDDebtDetailsList {
  id?: string,
  value?: CCDDebtDetailsItem,
}

export interface CCDDebtDetailsItem {
  debtType?: CCDDebtType,
  paymentAmount?: number,
  paymentFrequency?: CCDPaymentFrequency,
}

export enum CCDDebtType {
  MORTGAGE = 'MORTGAGE',
  RENT = 'RENT',
  COUNCIL_TAX = 'COUNCIL_TAX',
  GAS = 'GAS',
  ELECTRICITY = 'ELECTRICITY',
  WATER = 'WATER',
  MAINTENANCE_PAYMENTS = 'MAINTENANCE_PAYMENTS',
}

export enum CCDPaymentFrequency {
  ONCE_ONE_WEEK = 'ONCE_ONE_WEEK',
  ONCE_TWO_WEEKS = 'ONCE_TWO_WEEKS',
  ONCE_FOUR_WEEKS = 'ONCE_FOUR_WEEKS',
  ONCE_ONE_MONTH = 'ONCE_ONE_MONTH',
}


