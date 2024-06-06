import {IsNotEmpty} from 'class-validator';

export class RequestForReviewForm {

  @IsNotEmpty({message: 'ERRORS.VALID_ENTER_SUPPORT'})
    textArea?: string;

  constructor(textArea?: string) {
    this.textArea = textArea;
  }
}
