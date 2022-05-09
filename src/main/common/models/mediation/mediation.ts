import {FreeMediation} from '../../../common/form/models/mediation/freeMediation';
import {MediationIndividualTelephoneNumber} from './mediationIndividualTelephoneNumber';
import {NoMediationReason} from '../../../common/form/models/mediation/noMediationReason';

export class Mediation {
  individualTelephone?: MediationIndividualTelephoneNumber;
  mediationDisagreement?: FreeMediation;
  noMediationReason?: NoMediationReason;

  constructor(individualTelephone?: MediationIndividualTelephoneNumber, mediationDisagreement?: FreeMediation, noMediationReason?: NoMediationReason) {
    this.individualTelephone = individualTelephone;
    this.mediationDisagreement = mediationDisagreement;
    this.noMediationReason = noMediationReason;
  }
}
