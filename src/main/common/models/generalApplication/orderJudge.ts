import {IsNotEmpty, MaxLength} from 'class-validator';
import {FREE_TEXT_MAX_LENGTH} from 'common/form/validators/validationConstraints';

export class OrderJudge {
  @IsNotEmpty({ message: 'ERRORS.GENERAL_APPLICATION.ENTER_ORDER_JUDGE' })
  @MaxLength(FREE_TEXT_MAX_LENGTH, { message: 'ERRORS.VALID_TEXT_LENGTH' })
    text?: string;

  constructor(text?: string) {
    this.text = text;
  }

}
