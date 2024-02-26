import {AlternativeEmailAddress} from 'form/models/mediation/AlternativeEmailAddress';
import {UnavailableDatesMediation} from 'models/mediation/unavailableDatesMediation';
import {AlternativeTelephone} from 'form/models/mediation/AlternativeTelephone';
import {AlternativeContactPerson} from 'form/models/mediation/alternativeContactPerson';
import {GenericYesNoCarm} from 'form/models/genericYesNoCarm';
import {GenericYesNoCarmContactPersonConfirmation} from 'form/models/genericYesNoCarmContactPersonConfirmation';
import {GenericYesNoCarmEmailConfirmation} from 'form/models/genericYesNoCarmEmailConfirmation';

export class MediationCarm {
  isMediationContactNameCorrect?: GenericYesNoCarmContactPersonConfirmation;
  alternativeMediationContactPerson?: AlternativeContactPerson;
  isMediationEmailCorrect?: GenericYesNoCarmEmailConfirmation;
  alternativeMediationEmail?: AlternativeEmailAddress;
  isMediationPhoneCorrect?: GenericYesNoCarm;
  alternativeMediationTelephone?: AlternativeTelephone;
  hasUnavailabilityNextThreeMonths?: GenericYesNoCarm;
  unavailableDatesForMediation?: UnavailableDatesMediation;
  hasTelephoneMeditationAccessed?: boolean;
  hasAvailabilityMediationFinished?: boolean;

  constructor(isMediationContactNameCorrect?: GenericYesNoCarmContactPersonConfirmation, alternativeMediationContactPerson?: AlternativeContactPerson,
    isMediationEmailCorrect?: GenericYesNoCarmEmailConfirmation, alternativeMediationEmail?: AlternativeEmailAddress,
    isMediationPhoneCorrect?: GenericYesNoCarm, alternativeMediationTelephone?: AlternativeTelephone,
    hasUnavailabilityNextThreeMonths?: GenericYesNoCarm, unavailableDatesForMediation?: UnavailableDatesMediation,
    hasTelephoneMeditationAccessed?: boolean, hasAvailabilityMediationFinished?: boolean) {
    this.isMediationContactNameCorrect = isMediationContactNameCorrect;
    this.alternativeMediationContactPerson = alternativeMediationContactPerson;
    this.isMediationEmailCorrect = isMediationEmailCorrect;
    this.alternativeMediationEmail = alternativeMediationEmail;
    this.isMediationPhoneCorrect = isMediationPhoneCorrect;
    this.alternativeMediationTelephone = alternativeMediationTelephone;
    this.hasUnavailabilityNextThreeMonths = hasUnavailabilityNextThreeMonths;
    this.unavailableDatesForMediation = unavailableDatesForMediation;
    this.hasTelephoneMeditationAccessed = hasTelephoneMeditationAccessed;
    this.hasAvailabilityMediationFinished = hasAvailabilityMediationFinished;
  }
}
