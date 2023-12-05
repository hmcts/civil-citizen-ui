import {CanWeUse} from 'models/mediation/canWeUse';
import {CompanyTelephoneNumber} from 'form/models/mediation/companyTelephoneNumber';
import {GenericYesNo} from 'form/models/genericYesNo';
import {NoMediationReason} from 'form/models/mediation/noMediationReason';
import {AlternativeEmailAddress} from 'form/models/mediation/AlternativeEmailAddress';
import {UnavailableDatesMediation} from 'models/mediation/unavailableDatesMediation';
import {AlternativeTelephone} from 'form/models/mediation/AlternativeTelephone';

export class Mediation {
  canWeUse?: CanWeUse;
  mediationDisagreement?: GenericYesNo;
  noMediationReason?: NoMediationReason;
  companyTelephoneNumber: CompanyTelephoneNumber;
  isMediationContactNameCorrect?: GenericYesNo;
  hasTelephoneMeditationAccessed?: boolean;
  isMediationEmailCorrect?: GenericYesNo;
  isMediationPhoneCorrect?: GenericYesNo;
  hasAvailabilityMediationFinished?: boolean;
  alternativeMediationEmail?: AlternativeEmailAddress;
  hasUnavailabilityNextThreeMonths?: GenericYesNo;
  unavailableDatesForMediation?: UnavailableDatesMediation;
  alternativeMediationTelephone?: AlternativeTelephone;

  constructor(canWeUse?: CanWeUse, mediationDisagreement?: GenericYesNo, noMediationReason?: NoMediationReason,
    companyTelephoneNumber?: CompanyTelephoneNumber, mediationContactNameCorrect?: GenericYesNo, hasTelephoneMeditationAccessed = false,
    mediationEmailCorrect?: GenericYesNo, isMediationPhoneCorrect?: GenericYesNo,
    hasAvailabilityMediationFinished = false, alternativeMediationEmail?: AlternativeEmailAddress,
    hasUnavailabilityNextThreeMonths?: GenericYesNo,   unavailableDatesForMediation?: UnavailableDatesMediation,
    alternativeTelephone?: AlternativeTelephone) {
    this.canWeUse = canWeUse;
    this.mediationDisagreement = mediationDisagreement;
    this.noMediationReason = noMediationReason;
    this.companyTelephoneNumber = companyTelephoneNumber;
    this.isMediationContactNameCorrect = mediationContactNameCorrect;
    this.hasTelephoneMeditationAccessed = hasTelephoneMeditationAccessed;
    this.isMediationEmailCorrect = mediationEmailCorrect;
    this.isMediationPhoneCorrect = isMediationPhoneCorrect;
    this.hasAvailabilityMediationFinished = hasAvailabilityMediationFinished;
    this.alternativeMediationEmail = alternativeMediationEmail;
    this.hasUnavailabilityNextThreeMonths = hasUnavailabilityNextThreeMonths;
    this.unavailableDatesForMediation = unavailableDatesForMediation;
    this.alternativeMediationTelephone = alternativeTelephone;
  }
}
