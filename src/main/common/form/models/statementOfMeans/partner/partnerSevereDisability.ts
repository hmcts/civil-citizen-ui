import {IsDefined} from 'class-validator';

export class PartnerSevereDisability {
  @IsDefined({message: 'ERRORS.VALID_YES_NO_OPTION'})
    option?: string;

  constructor(option?: string) {
    this.option = option;
  }
}
