import {MediationIndTelephoneNumber} from '../../common/form/models/mediation/MediationIndTelephoneNumber';
import {FreeMediation} from '../../common/form/models/mediation/FreeMediation';

export class Mediation {
  individualTelephone?: MediationIndTelephoneNumber;
  mediationDisagreement?: FreeMediation;

  constructor(individualTelephone?: MediationIndTelephoneNumber, mediationDisagreement?: FreeMediation) {
    this.individualTelephone = individualTelephone;
    this.mediationDisagreement = mediationDisagreement;
  }
}
