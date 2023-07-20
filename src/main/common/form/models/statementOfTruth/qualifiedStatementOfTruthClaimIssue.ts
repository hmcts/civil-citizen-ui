import {IsNotEmpty, MaxLength} from 'class-validator';
import {SignatureType} from 'models/signatureType';
import {SIGNER_NAME_MAX_LENGTH, SIGNER_ROLE_MAX_LENGTH} from 'form/validators/validationConstraints';
import {StatementOfTruthForm} from 'form/models/statementOfTruth/statementOfTruthForm';

export class QualifiedStatementOfTruthClaimIssue extends StatementOfTruthForm {

  @MaxLength(SIGNER_NAME_MAX_LENGTH, {message: 'ERRORS.TEXT_TOO_MANY'})
  @IsNotEmpty({message: 'ERRORS.SIGNER_NAME_REQUIRED'})
    signerName?: string;

  @MaxLength(SIGNER_ROLE_MAX_LENGTH, {message: 'ERRORS.TEXT_TOO_MANY'})
  @IsNotEmpty({message: 'ERRORS.SIGNER_ROLE_REQUIRED'})
    signerRole?: string;

  @IsNotEmpty({message: 'ERRORS.CLAIM_SUBMITTED_ADVICE_REQUIRED'})
    acceptNoChangesAllowed?: boolean;

  constructor(isFullAmountRejected: boolean, signed?: boolean, directionsQuestionnaireSigned?: boolean, signerName?: string, signerRole?: string, acceptNoChangesAllowed?: boolean) {
    super(isFullAmountRejected, SignatureType.QUALIFIED, signed, directionsQuestionnaireSigned);
    this.signerName = signerName?.trim();
    this.signerRole = signerRole?.trim();
    this.acceptNoChangesAllowed = acceptNoChangesAllowed;
  }
}
