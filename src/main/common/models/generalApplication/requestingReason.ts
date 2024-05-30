import {IsNotEmpty, MaxLength} from 'class-validator';
import {FREE_TEXT_MAX_LENGTH} from 'form/validators/validationConstraints';

export class RequestingReason {
  @IsNotEmpty({message: 'ERRORS.GENERAL_APPLICATION.ENTER_REQUESTING_REASON'})
  @MaxLength(FREE_TEXT_MAX_LENGTH, { message: 'ERRORS.VALID_TEXT_LENGTH' })
    text?: string;

  constructor(text?: string) {
    this.text = text;
  }
}
