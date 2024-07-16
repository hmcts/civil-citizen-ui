import {IsNotEmpty} from 'class-validator';

export class RequestForReviewCommentsForm {
  @IsNotEmpty({message: 'ERRORS.DETAILS_REQUIRED'})
    textArea?: string;

  constructor(textArea?: string) {
    this.textArea = textArea;
  }
}
