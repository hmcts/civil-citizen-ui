import {IsDefined, ValidationError} from 'class-validator';
import {Form} from '../../../form/models/form';

export class SevereDisability extends Form {
  @IsDefined({message: 'ERRORS.VALID_YES_NO_OPTION'})
    option?: string;

  constructor(option?: string, errors?: ValidationError[]) {
    super(errors);
    this.option = option;
  }
}
