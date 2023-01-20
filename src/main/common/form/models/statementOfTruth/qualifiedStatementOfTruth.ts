import {IsNotEmpty, MaxLength} from 'class-validator';
import {StatementOfTruthForm} from './statementOfTruthForm';
import {SignatureType} from 'models/signatureType';
import {SIGNER_NAME_MAX_LENGTH, SIGNER_ROLE_MAX_LENGTH} from 'form/validators/validationConstraints';

export class QualifiedStatementOfTruth extends StatementOfTruthForm {

  @MaxLength(SIGNER_NAME_MAX_LENGTH, {message: 'ERRORS.TEXT_TOO_MANY'})
  @IsNotEmpty({message: 'ERRORS.SIGNER_NAME_REQUIRED'})
    signerName?: string;

  @MaxLength(SIGNER_ROLE_MAX_LENGTH, {message: 'ERRORS.TEXT_TOO_MANY'})
  @IsNotEmpty({message: 'ERRORS.SIGNER_ROLE_REQUIRED'})
    signerRole?: string;

  constructor(isFullAmountRejected: boolean, signed?: boolean, directionsQuestionnaireSigned?: boolean, signerName?: string, signerRole?: string) {
    super(isFullAmountRejected, SignatureType.QUALIFIED, signed, directionsQuestionnaireSigned);
    this.signerName = signerName?.trim();
    this.signerRole = signerRole?.trim();
  }
}
