import {IsDefined, IsNotEmpty, MaxLength} from 'class-validator';
import {VALID_REASON_REQUIRED, VALID_TEXT_LENGTH} from '../../../../form/validationErrors/errorMessageConstants';
import {FREE_TEXT_MAX_LENGTH} from '../../../validators/validationConstraints';

export class WhyDoYouDisagree {
  @IsDefined({message: VALID_REASON_REQUIRED})
  @IsNotEmpty({message: VALID_REASON_REQUIRED})
  @MaxLength(FREE_TEXT_MAX_LENGTH, {message: VALID_TEXT_LENGTH})
    text?: string;

  constructor(text?: string) {
    this.text = text;
  }

}
