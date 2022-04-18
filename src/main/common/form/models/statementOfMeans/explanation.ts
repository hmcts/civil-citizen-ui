import {IsNotEmpty} from 'class-validator';
import {ENTER_AN_EXPLANATION} from '../../../form/validationErrors/errorMessageConstants';

export class Explanation {
  @IsNotEmpty({message: ENTER_AN_EXPLANATION})
    text?: string;

  constructor(text?: string) {
    this.text = text;
  }
}