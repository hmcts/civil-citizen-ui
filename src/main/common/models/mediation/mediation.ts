import { MediationIndividualTelephoneNumber } from './mediationIndividualTelephoneNumber';
export class Mediation {
  individualTelephone?: MediationIndividualTelephoneNumber;

  constructor(individualTelephone?: MediationIndividualTelephoneNumber) {
    this.individualTelephone = individualTelephone;
  }
}
