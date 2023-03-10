import {YesNoUpperCamelCase} from 'form/models/yesNo';

export interface CCDSelfEmploymentDetails {
  jobTitle?: string,
  annualTurnover?: number,
  isBehindOnTaxPayment?: YesNoUpperCamelCase,
  amountOwed?: number,
  reason?: string,
}
