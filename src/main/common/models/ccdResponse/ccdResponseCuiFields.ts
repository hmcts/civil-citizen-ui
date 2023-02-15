import {YesNoUpperCamelCase} from 'form/models/yesNo';

export class CCDResponseCuiFields {
  partnerPensionCui?: YesNoUpperCamelCase;
  partnerDisabilityCui?: YesNoUpperCamelCase;
  partnerSevereDisabilityCui?: YesNoUpperCamelCase;
  childrenEducationCui?: string;
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
