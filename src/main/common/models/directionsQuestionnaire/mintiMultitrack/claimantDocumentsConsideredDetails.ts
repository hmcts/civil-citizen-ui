import {IsNotEmpty} from 'class-validator';

export class ClaimantDocumentsConsideredDetails {

  title = 'PAGES.CLAIMANT_DOCUMENTS_CONSIDERED_DETAILS.TEXT_AREA.LABEL';
  hint = 'PAGES.CLAIMANT_DOCUMENTS_CONSIDERED_DETAILS.TEXT_AREA.HINT';

  @IsNotEmpty({message: 'ERRORS.CLAIMANT_DOCUMENTS_CONSIDERED'})
  claimantDocumentsConsideredDetails?: string;

  constructor(claimantDocumentsConsideredDetails?: string) {
    this.claimantDocumentsConsideredDetails = claimantDocumentsConsideredDetails;
  }
}
