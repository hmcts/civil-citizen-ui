import {IsDefined, ValidationError} from 'class-validator';
import {Form} from '../../../form/models/form';
import {VALID_YES_NO_OPTION} from '../../../form/validationErrors/errorMessageConstants';

export class Disability extends Form {
  @IsDefined({message: VALID_YES_NO_OPTION})
    option?: string;

  constructor(disablity?: string, errors?: ValidationError[]) {
    super(errors);
    this.option = disablity;
  }
}
