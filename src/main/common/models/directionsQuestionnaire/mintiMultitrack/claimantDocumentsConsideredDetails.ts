import {IsNotEmpty} from 'class-validator';
import {ValidationArgs} from 'form/models/genericForm';

const generateErrorMessage = (messageName: string): string => {
  return messageName;
};

const withMessage = (buildErrorFn: (messageName: string) => string) => {
  return (args: ValidationArgs<ClaimantDocumentsConsideredDetails>): string => {
    return buildErrorFn(args.object.messageName);
  };
};

export class ClaimantDocumentsConsideredDetails {

  title: string;
  hint = 'PAGES.DOCUMENTS_CONSIDERED_DETAILS.TEXT_AREA.HINT';
  messageName: string;

  @IsNotEmpty({message: withMessage(generateErrorMessage)})
    claimantDocumentsConsideredDetails?: string;

  constructor(claimantDocumentsConsideredDetails?: string,  isClaimant = false, messageName?: string) {

    this.title = isClaimant? 'PAGES.DOCUMENTS_CONSIDERED_DETAILS.TEXT_AREA.LABEL_WITH_DEFENDANT' : 'PAGES.DOCUMENTS_CONSIDERED_DETAILS.TEXT_AREA.LABEL_WITH_CLAIMANT';
    this.claimantDocumentsConsideredDetails = claimantDocumentsConsideredDetails;
    this.messageName = messageName;
  }
}
