import {IsDefined} from 'class-validator';

export class GenericYesNo {
  @IsDefined({message: 'ERRORS.VALID_YES_NO_SELECTION'})
    option?: string;

  constructor(option?: string) {
    this.option = option;
  }
}
