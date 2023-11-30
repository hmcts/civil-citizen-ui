import {CanWeUse} from 'models/mediation/canWeUse';
import {CompanyTelephoneNumber} from 'form/models/mediation/companyTelephoneNumber';
import {GenericYesNo} from 'form/models/genericYesNo';
import {NoMediationReason} from 'form/models/mediation/noMediationReason';
import {AlternativeEmailAddress} from 'form/models/mediation/AlternativeEmailAddress';
import {UnavailableDatesMediation} from 'models/mediation/unavailableDatesMediation';

export class Mediation {
  canWeUse?: CanWeUse;
  mediationDisagreement?: GenericYesNo;
  noMediationReason?: NoMediationReason;
  companyTelephoneNumber: CompanyTelephoneNumber;
  hasTelephoneMeditationAccessed?: boolean;
  isMediationEmailCorrect?: GenericYesNo;
  isMediationPhoneCorrect?: GenericYesNo;
  hasAvailabilityMediationFinished?: boolean;
  alternativeMediationEmail?: AlternativeEmailAddress;
  hasUnavailabilityNextThreeMonths?: GenericYesNo;
  unavailableDatesForMediation?: UnavailableDatesMediation;

  constructor(canWeUse?: CanWeUse, mediationDisagreement?: GenericYesNo, noMediationReason?: NoMediationReason,
    companyTelephoneNumber?: CompanyTelephoneNumber, hasTelephoneMeditationAccessed = false,
    mediationEmailCorrect?: GenericYesNo, isMediationPhoneCorrect?: GenericYesNo,
    hasAvailabilityMediationFinished = false, alternativeMediationEmail?: AlternativeEmailAddress,
    hasUnavailabilityNextThreeMonths?: GenericYesNo,   unavailableDatesForMediation?: UnavailableDatesMediation) {
    this.canWeUse = canWeUse;
    this.mediationDisagreement = mediationDisagreement;
    this.noMediationReason = noMediationReason;
    this.companyTelephoneNumber = companyTelephoneNumber;
    this.hasTelephoneMeditationAccessed = hasTelephoneMeditationAccessed;
    this.isMediationEmailCorrect = mediationEmailCorrect;
    this.isMediationPhoneCorrect = isMediationPhoneCorrect;
    this.hasAvailabilityMediationFinished = hasAvailabilityMediationFinished;
    this.alternativeMediationEmail = alternativeMediationEmail;
    this.hasUnavailabilityNextThreeMonths = hasUnavailabilityNextThreeMonths;
    this.unavailableDatesForMediation = unavailableDatesForMediation;
  }
}
