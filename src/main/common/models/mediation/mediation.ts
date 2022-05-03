import {MediationIndividualTelephoneNumber} from './mediationIndividualTelephoneNumber';
import {FreeMediation} from './freeMediation';

export class Mediation {
  individualTelephone?: MediationIndividualTelephoneNumber;
  mediationDisagreement?: FreeMediation;

  constructor(individualTelephone?: MediationIndividualTelephoneNumber, mediationDisagreement?: FreeMediation) {
    this.individualTelephone = individualTelephone;
    this.mediationDisagreement = mediationDisagreement;
  }
}
