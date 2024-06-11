import {IsNotEmpty} from 'class-validator';

export class DisclosureOfElectronicDocumentsIssues {

  title = 'PAGES.DISCLOSURE_OF_ELECTRONIC_DOCUMENTS_ISSUES.TEXT_AREA.LABEL';
  hint = 'PAGES.DISCLOSURE_OF_ELECTRONIC_DOCUMENTS_ISSUES.TEXT_AREA.HINT';

  @IsNotEmpty({message: 'ERRORS.DISCLOSURE_OF_ELECTRONIC_DOCUMENTS_ISSUES'})
    disclosureOfElectronicDocumentsIssues?: string;

  constructor(disclosureOfElectronicDocumentsIssues?: string) {
    this.disclosureOfElectronicDocumentsIssues = disclosureOfElectronicDocumentsIssues;
  }
}
