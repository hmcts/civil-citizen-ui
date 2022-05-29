import {IsDefined, IsNotEmpty, MaxLength} from 'class-validator';

import {DEFENCE_REQUIRED, TEXT400_TOO_LONG} from '../validationErrors/errorMessageConstants';

const FREE_TEXT_MAX_LENGTH = 400;

export class Defence {
  @IsDefined({message: DEFENCE_REQUIRED})
  @IsNotEmpty({message: DEFENCE_REQUIRED})
  @MaxLength(FREE_TEXT_MAX_LENGTH, {message: TEXT400_TOO_LONG})
    text?: string;

  constructor(text?: string) {
    this.text = text;
  }
}
