import { CompanyTelephoneNumber } from '../../form/models/mediation/companyTelephoneNumber';
export class Mediation {
  companyTelephoneNumber: CompanyTelephoneNumber;

  constructor(companyTelephoneNumber?:CompanyTelephoneNumber) {
    this.companyTelephoneNumber = companyTelephoneNumber;
  }
}
