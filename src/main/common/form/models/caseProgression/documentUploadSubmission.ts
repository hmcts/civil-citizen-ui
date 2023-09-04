import {IsNotEmpty} from 'class-validator';

export class documentUploadSubmissionForm {

  @IsNotEmpty({message: 'Tell us if you confirm the documents are correct'})
    signed?: boolean;

  constructor(signed?: boolean) {
    this.signed = signed;
  }
}
