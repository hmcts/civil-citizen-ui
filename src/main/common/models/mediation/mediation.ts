import {FreeMediation} from '../../../common/form/models/mediation/freeMediation';
import {CanWeUse} from '../../../common/models/mediation/canWeUse';
import {NoMediationReason} from '../../../common/form/models/mediation/noMediationReason';

export class Mediation {
  canWeUse?: CanWeUse;
  mediationDisagreement?: FreeMediation;
  noMediationReason?: NoMediationReason;

  constructor(canWeUse?: CanWeUse, mediationDisagreement?: FreeMediation, noMediationReason?: NoMediationReason) {
    this.canWeUse = canWeUse;
    this.mediationDisagreement = mediationDisagreement;
    this.noMediationReason = noMediationReason;
  }
}
