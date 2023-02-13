import {YesNoUpperCamelCase} from 'form/models/yesNo';

export interface CCDResponseCuiFields {
  partnerPensionCui?: YesNoUpperCamelCase,
  partnerDisabilityCui?: YesNoUpperCamelCase,
  partnerSevereDisabilityCui?: YesNoUpperCamelCase,
  childrenEducationCui?: string,
  canWeUseMediationCui?: YesNoUpperCamelCase,
  canWeUseMediationPhoneCui?: string,
  mediationDisagreementCui?: YesNoUpperCamelCase,
  noMediationReasonCui?: string,
  moMediationOtherReasonCui?: string,
  companyTelephoneOptionMediationCui: YesNoUpperCamelCase,
  companyTelephoneConfirmationMediationCui?: string,
  companyTelephoneContactPersonMediationCui?: string,
  companyTelephonePhoneNumberMediationCui?: string,
}
