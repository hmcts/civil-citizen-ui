import {IsNotEmpty} from 'class-validator';
import {SignatureType} from 'models/signatureType';
import {StatementOfTruthForm} from 'form/models/statementOfTruth/statementOfTruthForm';

export class StatementOfTruthFormClaimIssue extends StatementOfTruthForm{

  @IsNotEmpty({message: 'ERRORS.CLAIM_SUBMITTED_ADVICE_REQUIRED'})
    acceptNoChangesAllowed?: boolean;

  constructor(isFullAmountRejected: boolean, type?: SignatureType, signed?: boolean, directionsQuestionnaireSigned?: boolean, acceptNoChangesAllowed?: boolean) {
    super(isFullAmountRejected, type, signed, directionsQuestionnaireSigned);
    this.acceptNoChangesAllowed = acceptNoChangesAllowed;
  }
}
