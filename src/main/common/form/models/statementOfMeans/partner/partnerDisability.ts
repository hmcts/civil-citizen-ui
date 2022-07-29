import {IsDefined, ValidationError} from 'class-validator';
import {Form} from '../../form';

export class PartnerDisability extends Form {
  @IsDefined({message: 'ERRORS.VALID_YES_NO_OPTION'})
    option?: string;

  constructor(option?: string, errors?: ValidationError[]) {
    super(errors);
    this.option = option;
  }
}
