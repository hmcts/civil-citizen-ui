import {CanWeUse} from 'models/mediation/canWeUse';
import {CompanyTelephoneNumber} from 'form/models/mediation/companyTelephoneNumber';
import {GenericYesNo} from 'form/models/genericYesNo';
import {NoMediationReason} from 'form/models/mediation/noMediationReason';

export class Mediation {
  canWeUse?: CanWeUse;
  mediationDisagreement?: GenericYesNo;
  noMediationReason?: NoMediationReason;
  companyTelephoneNumber: CompanyTelephoneNumber;
  isMediationPhoneCorrect?: GenericYesNo;
  hasTelephoneMeditationAccessed?: boolean;
  hasAvailabilityMediationFinished?: boolean;

  constructor(canWeUse?: CanWeUse, mediationDisagreement?: GenericYesNo, noMediationReason?: NoMediationReason,
    companyTelephoneNumber?: CompanyTelephoneNumber, isMediationPhoneCorrect?: GenericYesNo,
    hasTelephoneMeditationAccessed = false,
    hasAvailabilityMediationFinished = false) {
    this.canWeUse = canWeUse;
    this.mediationDisagreement = mediationDisagreement;
    this.noMediationReason = noMediationReason;
    this.companyTelephoneNumber = companyTelephoneNumber;
    this.isMediationPhoneCorrect = isMediationPhoneCorrect;
    this.hasTelephoneMeditationAccessed = hasTelephoneMeditationAccessed;
    this.hasAvailabilityMediationFinished = hasAvailabilityMediationFinished;
  }
}
