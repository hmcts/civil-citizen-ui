import {FreeMediation} from '../../../common/form/models/mediation/freeMediation';
import {CanWeUse} from '../../../common/models/mediation/canWeUse';
import {NoMediationReason} from '../../../common/form/models/mediation/noMediationReason';
import {CompanyTelephoneNumber} from '../../form/models/mediation/companyTelephoneNumber';

export class Mediation {
  canWeUse?: CanWeUse;
  mediationDisagreement?: FreeMediation;
  noMediationReason?: NoMediationReason;
  companyTelephoneNumber: CompanyTelephoneNumber;

  constructor(canWeUse?: CanWeUse, mediationDisagreement?: FreeMediation, noMediationReason?: NoMediationReason, companyTelephoneNumber?: CompanyTelephoneNumber) {
    this.canWeUse = canWeUse;
    this.mediationDisagreement = mediationDisagreement;
    this.noMediationReason = noMediationReason;
    this.companyTelephoneNumber = companyTelephoneNumber;
  }
}
