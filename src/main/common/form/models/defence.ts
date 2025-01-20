import {IsDefined, IsNotEmpty} from 'class-validator';

export class Defence {
  @IsDefined({message: 'ERRORS.DEFENCE_REQUIRED'})
  @IsNotEmpty({message: 'ERRORS.DEFENCE_REQUIRED'})
    text?: string;

  constructor(text?: string) {
    this.text = text;
  }
}
