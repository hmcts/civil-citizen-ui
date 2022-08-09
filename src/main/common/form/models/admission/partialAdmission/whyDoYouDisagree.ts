import {IsDefined, IsNotEmpty, MaxLength} from 'class-validator';
import {FREE_TEXT_MAX_LENGTH} from '../../../validators/validationConstraints';

export class WhyDoYouDisagree {
  @IsDefined({message: 'ERRORS.VALID_DISAGREE_REASON_REQUIRED'})
  @IsNotEmpty({message: 'ERRORS.VALID_DISAGREE_REASON_REQUIRED'})
  @MaxLength(FREE_TEXT_MAX_LENGTH, {message: 'ERRORS.VALID_DISAGREE_REASON_REQUIRED'})
    text?: string;

  constructor(text?: string) {
    this.text = text;
  }
}
