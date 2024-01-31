import {IsNotEmpty} from 'class-validator';
import {QualifiedStatementOfTruth} from 'form/models/statementOfTruth/qualifiedStatementOfTruth';

export class QualifiedStatementOfTruthClaimIssue extends QualifiedStatementOfTruth {

  @IsNotEmpty({message: 'ERRORS.CLAIM_SUBMITTED_ADVICE_REQUIRED'})
    acceptNoChangesAllowed?: boolean;

  constructor(isFullAmountRejected: boolean, signed?: boolean, directionsQuestionnaireSigned?: boolean, signerName?: string, signerRole?: string, acceptNoChangesAllowed?: boolean) {
    super(isFullAmountRejected, signed, directionsQuestionnaireSigned, signerName, signerRole);
    this.acceptNoChangesAllowed = acceptNoChangesAllowed;
  }
}
