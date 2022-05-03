import {FreeMediation} from '../../../common/form/models/mediation/freeMediation';
import {MediationIndividualTelephoneNumber} from './mediationIndividualTelephoneNumber';
import {CompanyTelephoneNumber} from '../../form/models/mediation/companyTelephoneNumber';

export class Mediation {
  individualTelephone?: MediationIndividualTelephoneNumber;
  mediationDisagreement?: FreeMediation;
  companyTelephoneNumber: CompanyTelephoneNumber;

  constructor(individualTelephone?: MediationIndividualTelephoneNumber, mediationDisagreement?: FreeMediation, companyTelephoneNumber?:CompanyTelephoneNumber) {
    this.individualTelephone = individualTelephone;
    this.mediationDisagreement = mediationDisagreement;
    this.companyTelephoneNumber = companyTelephoneNumber;
  }
}
