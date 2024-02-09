import {YesNoUpperCamelCase} from 'form/models/yesNo';

export interface CCDMediation {
  canWeUseMediationLiP?: YesNoUpperCamelCase;
  canWeUseMediationPhoneLiP?: string;
  mediationDisagreementLiP?: YesNoUpperCamelCase;
  noMediationReasonLiP?: string;
  noMediationOtherReasonLiP?: string;
  companyTelephoneOptionMediationLiP: YesNoUpperCamelCase;
  companyTelephoneConfirmationMediationLiP?: string;
  companyTelephoneContactPersonMediationLiP?: string;
  companyTelephonePhoneNumberMediationLiP?: string;

}
