import {IsNotEmpty, MaxLength} from 'class-validator';
import {SIGNER_NAME_MAX_LENGTH} from 'form/validators/validationConstraints';

export class QualifiedStatementOfTruth {

  @IsNotEmpty({message: 'ERRORS.STATEMENT_OF_TRUTH_REQUIRED_MESSAGE'})
    signed?: boolean;

  @MaxLength(SIGNER_NAME_MAX_LENGTH, {message: 'ERRORS.FULL_NAME_TOO_LONG'})
  @IsNotEmpty({message: 'ERRORS.GENERAL_APPLICATION.QUALIFIED_SOT.ERROR_FULL_NAME'})
    name?: string;
  @MaxLength(SIGNER_NAME_MAX_LENGTH, {message: 'ERRORS.FULL_NAME_TOO_LONG'})
  @IsNotEmpty({message: 'ERRORS.GENERAL_APPLICATION.QUALIFIED_SOT.ERROR_ROLE'})
    title?: string;

  constructor(signed?: boolean, name?: string, title?: string) {
    this.signed = signed;
    this.name = name?.trim();
    this.title = title?.trim();
  }
}
