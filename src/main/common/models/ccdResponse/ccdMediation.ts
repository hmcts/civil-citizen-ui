import {YesNoUpperCamelCase} from 'form/models/yesNo';
import {CCDUnavailableDates} from 'models/ccdResponse/ccdSmallClaimHearing';

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
  isMediationContactNameCorrect?:YesNoUpperCamelCase
  alternativeMediationContactPerson?: string;
  isMediationEmailCorrect?:YesNoUpperCamelCase
  alternativeMediationEmail?: string;
  isMediationPhoneCorrect?:YesNoUpperCamelCase
  alternativeMediationTelephone?: string;
  hasUnavailabilityNextThreeMonths?:YesNoUpperCamelCase
  unavailableDatesForMediation?:CCDUnavailableDates[];

}
