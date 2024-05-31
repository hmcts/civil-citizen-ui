import {IsNotEmpty, MaxLength} from 'class-validator';
import {SIGNER_NAME_MAX_LENGTH} from 'form/validators/validationConstraints';

export class StatementOfTruthForm {

  @IsNotEmpty({message: 'ERRORS.STATEMENT_OF_TRUTH_REQUIRED_MESSAGE'})
    signed?: boolean;

  @MaxLength(SIGNER_NAME_MAX_LENGTH, { message: 'ERRORS.FULL_NAME_TOO_LONG' })
  @IsNotEmpty({message: 'ERRORS.SIGNER_NAME_REQUIRED'})
    name?: string;

  constructor(signed?: boolean, name?: string) {
    this.signed = signed;
    this.name = name?.trim();
  }
}
