import {IsDefined, IsNotEmpty, MaxLength} from 'class-validator';

const FREE_TEXT_MAX_LENGTH = 400;

export class Defence {
  @IsDefined({message: 'ERRORS.DEFENCE_REQUIRED'})
  @IsNotEmpty({message: 'ERRORS.DEFENCE_REQUIRED'})
  @MaxLength(FREE_TEXT_MAX_LENGTH, {message: 'ERRORS.TEXT400_TOO_LONG'})
    text?: string;

  constructor(text?: string) {
    this.text = text;
  }
}
