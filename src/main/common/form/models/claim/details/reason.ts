import {IsNotEmpty} from 'class-validator';

export class Reason {
  @IsNotEmpty({message: 'ERRORS.REASON_REQUIRED'})
    text?: string;

  constructor(text?: string) {
    this.text = text;
  }
}