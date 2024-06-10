import {IsNotEmpty} from 'class-validator';

export class DisclosureNonElectronicDocument {

  title = 'PAGES.DISCLOSURE_NON_ELECTRONIC_DOCUMENTS.TEXT_AREA.LABEL';
  hint = 'PAGES.DISCLOSURE_NON_ELECTRONIC_DOCUMENTS.TEXT_AREA.HINT';

  @IsNotEmpty({message: 'ERRORS.DISCLOSURE_NON_ELECTRONIC_DOCUMENTS'})
    hasAnAgreementBeenReached?: string;

  constructor(disclosureNonElectronicDocuments?: string) {
    this.hasAnAgreementBeenReached = disclosureNonElectronicDocuments;
  }
}
