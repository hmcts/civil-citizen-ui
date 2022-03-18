import { IsDefined, ValidationError } from 'class-validator';
import { Form } from '../../form';
import { VALID_OPTION } from '../../../validationErrors/errorMessageConstants';

export class PartnerSevereDisabilityOption extends Form {
  static readonly YES = 'yes';
  static readonly NO = 'no';
}

export class PartnerSevereDisability extends Form {
  @IsDefined({ message: VALID_OPTION })
  option?: string;

  constructor(option?: string, errors?: ValidationError[]) {
    super(errors);
    this.option = option;
  }
}
