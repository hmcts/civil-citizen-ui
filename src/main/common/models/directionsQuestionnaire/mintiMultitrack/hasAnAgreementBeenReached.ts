import {IsNotEmpty} from 'class-validator';

export class HasAnAgreementBeenReached {

  @IsNotEmpty({message: 'ERRORS.HAS_AN_AGREEMENT_BEEN_REACHED'})
    hasAnAgreementBeenReached?: string;

  constructor(disclosureNonElectronicDocuments?: string) {
    this.hasAnAgreementBeenReached = disclosureNonElectronicDocuments;
  }
}
