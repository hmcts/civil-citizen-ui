import {IsDefined, ValidationError} from 'class-validator';
import {Form} from '../../form';
import {VALID_OPTION} from '../../../validationErrors/errorMessageConstants';

export class PartnerSevereDisability extends Form {
  @IsDefined({message: VALID_OPTION})
    option?: string;

  constructor(option?: string, errors?: ValidationError[]) {
    super(errors);
    this.option = option;
  }
}
