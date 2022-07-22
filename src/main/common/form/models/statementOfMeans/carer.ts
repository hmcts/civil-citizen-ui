import {IsDefined} from 'class-validator';
import {VALID_YES_NO_OPTION} from '../../../form/validationErrors/errorMessageConstants';

export class Carer{
  @IsDefined({message: VALID_YES_NO_OPTION})
    option?: string;

  constructor(option?: string) {
    this.option = option;
  }
}
