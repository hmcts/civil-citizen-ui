import {FreeMediation} from '../../../common/form/models/mediation/freeMediation';
import {MediationIndividualTelephoneNumber} from './mediationIndividualTelephoneNumber';
import {CompanyTelephoneNumber} from '../../form/models/mediation/companyTelephoneNumber';
import {NoMediationReason} from '../../../common/form/models/mediation/noMediationReason';

export class Mediation {
  individualTelephone?: MediationIndividualTelephoneNumber;
  mediationDisagreement?: FreeMediation;
  companyTelephoneNumber: CompanyTelephoneNumber;
  noMediationReason?: NoMediationReason;

  constructor(
    individualTelephone?: MediationIndividualTelephoneNumber, 
    mediationDisagreement?: FreeMediation, 
    companyTelephoneNumber?:CompanyTelephoneNumber,
    noMediationReason?: NoMediationReason
  ) {
    this.individualTelephone = individualTelephone;
    this.mediationDisagreement = mediationDisagreement;
    this.companyTelephoneNumber = companyTelephoneNumber;
    this.noMediationReason = noMediationReason;
  }
}
