import {FreeMediation} from "../../../common/form/models/mediation/freeMediation";
import {MediationIndividualTelephoneNumber} from "./mediationIndividualTelephoneNumber";

export class Mediation {
  individualTelephone?: MediationIndividualTelephoneNumber;
  mediationDisagreement?: FreeMediation;

  constructor(individualTelephone?: MediationIndividualTelephoneNumber, mediationDisagreement?: FreeMediation) {
    this.individualTelephone = individualTelephone;
    this.mediationDisagreement = mediationDisagreement;
  }
}
