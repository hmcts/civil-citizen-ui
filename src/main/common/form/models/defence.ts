import {IsDefined, IsNotEmpty, MaxLength} from 'class-validator';

export class Defence {
  @IsDefined({message: 'ERRORS.DEFENCE_REQUIRED'})
  @IsNotEmpty({message: 'ERRORS.DEFENCE_REQUIRED'})
  @MaxLength(400, {message: 'ERRORS.TEXT400_TOO_LONG'})
    text?: string;

  constructor(text?: string) {
    this.text = text;
  }
}
