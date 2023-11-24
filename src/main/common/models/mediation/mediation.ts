import {CanWeUse} from 'models/mediation/canWeUse';
import {CompanyTelephoneNumber} from 'form/models/mediation/companyTelephoneNumber';
import {GenericYesNo} from 'form/models/genericYesNo';
import {NoMediationReason} from 'form/models/mediation/noMediationReason';

export class Mediation {
  canWeUse?: CanWeUse;
  mediationDisagreement?: GenericYesNo;
  noMediationReason?: NoMediationReason;
  companyTelephoneNumber: CompanyTelephoneNumber;
  hasTelephoneMeditationAccessed?: boolean;
  isMediationEmailCorrect?: GenericYesNo;

  constructor(canWeUse?: CanWeUse, mediationDisagreement?: GenericYesNo, noMediationReason?: NoMediationReason, companyTelephoneNumber?: CompanyTelephoneNumber, hasTelephoneMeditationAccessed = false, mediationEmailCorrect?: GenericYesNo) {
    this.canWeUse = canWeUse;
    this.mediationDisagreement = mediationDisagreement;
    this.noMediationReason = noMediationReason;
    this.companyTelephoneNumber = companyTelephoneNumber;
    this.hasTelephoneMeditationAccessed = hasTelephoneMeditationAccessed;
    this.isMediationEmailCorrect = mediationEmailCorrect;
  }
}
