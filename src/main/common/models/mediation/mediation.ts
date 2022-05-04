import {FreeMediation} from '../../../common/form/models/mediation/freeMediation';
import {CanWeUse} from './canWeUse';

export class Mediation {
  canWeUse?: CanWeUse;
  mediationDisagreement?: FreeMediation;

  constructor(canWeUse?: CanWeUse, mediationDisagreement?: FreeMediation) {
    this.canWeUse = canWeUse;
    this.mediationDisagreement = mediationDisagreement;
  }
}
