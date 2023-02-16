import {YesNoUpperCamelCase} from 'form/models/yesNo';

export interface CCDMediation {
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
