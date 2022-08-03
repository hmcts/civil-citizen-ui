import {IsDefined, ValidationError} from 'class-validator';
import {Form} from '../../../form/models/form';
export class Disability extends Form {
  @IsDefined({message: 'ERRORS.VALID_YES_NO_OPTION'})
    option?: string;

  constructor(disablity?: string, errors?: ValidationError[]) {
    super(errors);
    this.option = disablity;
  }
}
