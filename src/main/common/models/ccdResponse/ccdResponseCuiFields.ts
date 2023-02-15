import {CCDFinancialDetailsCuiFields} from 'models/ccdResponse/ccdFinancialDetailsCuiFields';

export interface CCDResponseCuiFields {
  respondent1FinancialDetailsFromCui?: CCDFinancialDetailsCuiFields,

  canWeUseMediationCui?: YesNoUpperCamelCase;
  canWeUseMediationPhoneCui?: string;
  mediationDisagreementCui?: YesNoUpperCamelCase;
  noMediationReasonCui?: string;
  noMediationOtherReasonCui?: string;
  companyTelephoneOptionMediationCui: YesNoUpperCamelCase;
  companyTelephoneConfirmationMediationCui?: string;
  companyTelephoneContactPersonMediationCui?: string;
  companyTelephonePhoneNumberMediationCui?: string;
}
