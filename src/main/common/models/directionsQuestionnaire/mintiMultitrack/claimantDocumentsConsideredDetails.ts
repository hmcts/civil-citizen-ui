import {IsNotEmpty} from 'class-validator';

export class ClaimantDocumentsConsideredDetails {

  title: string;
  hint = 'PAGES.DOCUMENTS_CONSIDERED_DETAILS.TEXT_AREA.HINT';

  @IsNotEmpty({message: 'ERRORS.CLAIMANT_DOCUMENTS_CONSIDERED'})
    claimantDocumentsConsideredDetails?: string;

  constructor(claimantDocumentsConsideredDetails?: string, isClaimant = false) {
    this.title = isClaimant? 'PAGES.DOCUMENTS_CONSIDERED_DETAILS.TEXT_AREA.LABEL_WITH_DEFENDANT' : 'PAGES.DOCUMENTS_CONSIDERED_DETAILS.TEXT_AREA.LABEL_WITH_CLAIMANT';
    this.claimantDocumentsConsideredDetails = claimantDocumentsConsideredDetails;
  }
}
