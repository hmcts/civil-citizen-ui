import {IsDefined, ValidationError} from 'class-validator';
import {Form} from '../../form';
import {VALID_YES_NO_OPTION} from '../../../validationErrors/errorMessageConstants';

export class CohabitingOption extends Form {
  static readonly YES = 'yes';
  static readonly NO = 'no';
}

export class Cohabiting extends Form {
  @IsDefined({message: VALID_YES_NO_OPTION})
    option?: string;

  constructor(option?: string, errors?: ValidationError[]) {
    super(errors);
    this.option = option;
  }
}
