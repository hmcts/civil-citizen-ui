import {IsNotEmpty} from 'class-validator';

export class Explanation {
  @IsNotEmpty({message: 'ERRORS.ENTER_AN_EXPLANATION'})
    text?: string;

  constructor(text?: string) {
    this.text = text;
  }
}
