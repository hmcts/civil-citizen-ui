import {IsNotEmpty} from 'class-validator';

export class HasAnAgreementBeenReached {

  @IsNotEmpty({message: 'ERRORS.DISCLOSURE_NON_ELECTRONIC_DOCUMENTS'})
    hasAnAgreementBeenReached?: string;

  constructor(disclosureNonElectronicDocuments?: string) {
    this.hasAnAgreementBeenReached = disclosureNonElectronicDocuments;
  }
}
