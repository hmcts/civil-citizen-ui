import {IsNotEmpty, Validate} from 'class-validator';
import {HtmlValidator} from '../../../form/validators/htmlValidator';

export class RequestForReviewCommentsForm {
  @IsNotEmpty({message: 'ERRORS.DETAILS_REQUIRED'})
  @Validate(HtmlValidator)
    textArea?: string;

  constructor(textArea?: string) {
    this.textArea = textArea;
  }
}
