import {YesNoUpperCamelCase} from 'form/models/yesNo';
import {CCDUnavailableDates} from 'models/ccdResponse/ccdSmallClaimHearing';

export interface CcdMediationCarm {
  isMediationContactNameCorrect?:YesNoUpperCamelCase
  alternativeMediationContactPerson?: string;
  isMediationEmailCorrect?:YesNoUpperCamelCase
  alternativeMediationEmail?: string;
  isMediationPhoneCorrect?:YesNoUpperCamelCase
  alternativeMediationTelephone?: string;
  hasUnavailabilityNextThreeMonths?:YesNoUpperCamelCase
  unavailableDatesForMediation?:CCDUnavailableDates[];

}
