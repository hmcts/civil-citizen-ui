import {IsDefined, ValidationError} from 'class-validator';
import {Form} from '../../../form/models/form';
import {VALID_OPTION} from '../../../form/validationErrors/errorMessageConstants';

export class DisabilityOption extends Form {
  static readonly YES = 'yes';
  static readonly NO = 'no';
}

export class Disability extends Form {
  @IsDefined({message: VALID_OPTION})
    option?: string;

  constructor(option?: string, errors?: ValidationError[]) {
    super(errors);
    this.option = option;
  }
}
