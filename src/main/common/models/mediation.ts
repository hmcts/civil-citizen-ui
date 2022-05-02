import { MediationIndTelephoneNumber } from './mediationIndTelephoneNumber';
export class Mediation {
  individualTelephone?: MediationIndTelephoneNumber;

  constructor(individualTelephone?: MediationIndTelephoneNumber) {
    this.individualTelephone = individualTelephone;
  }
}
