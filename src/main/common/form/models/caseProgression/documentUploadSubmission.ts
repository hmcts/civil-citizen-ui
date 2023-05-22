import {IsNotEmpty} from 'class-validator';

export class documentUploadSubmissionForm {

  @IsNotEmpty({message: 'ERRORS.STATEMENT_OF_TRUTH_REQUIRED_MESSAGE'})
    signed?: boolean;

  constructor(signed?: boolean) {
    this.signed = signed;
  }
}
