import {GenericYesNo} from 'form/models/genericYesNo';
import {AlternativeEmailAddress} from 'form/models/mediation/AlternativeEmailAddress';
import {UnavailableDatesMediation} from 'models/mediation/unavailableDatesMediation';
import {AlternativeTelephone} from 'form/models/mediation/AlternativeTelephone';
import {AlternativeContactPerson} from 'form/models/mediation/alternativeContactPerson';

export class MediationCarm {
  isMediationContactNameCorrect?: GenericYesNo;
  alternativeMediationContactPerson?: AlternativeContactPerson;
  isMediationEmailCorrect?: GenericYesNo;
  alternativeMediationEmail?: AlternativeEmailAddress;
  isMediationPhoneCorrect?: GenericYesNo;
  alternativeMediationTelephone?: AlternativeTelephone;
  hasUnavailabilityNextThreeMonths?: GenericYesNo;
  unavailableDatesForMediation?: UnavailableDatesMediation;
  hasTelephoneMeditationAccessed?: boolean;
  hasAvailabilityMediationFinished?: boolean;


  constructor(isMediationContactNameCorrect?: GenericYesNo, alternativeMediationContactPerson?: AlternativeContactPerson,
              isMediationEmailCorrect?: GenericYesNo, alternativeMediationEmail?: AlternativeEmailAddress, isMediationPhoneCorrect?: GenericYesNo,
              alternativeMediationTelephone?: AlternativeTelephone, hasUnavailabilityNextThreeMonths?: GenericYesNo,
              unavailableDatesForMediation?: UnavailableDatesMediation, hasTelephoneMeditationAccessed?: boolean,
              hasAvailabilityMediationFinished?: boolean) {
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
