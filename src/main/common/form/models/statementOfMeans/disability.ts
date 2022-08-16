import {IsDefined} from 'class-validator';

export class Disability {
  @IsDefined({message: 'ERRORS.VALID_YES_NO_OPTION'})
    option?: string;

  constructor(disability?: string) {
    this.option = disability;
  }
}
