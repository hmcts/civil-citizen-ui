import {IsDefined, IsNotEmpty, ValidationError} from 'class-validator';
import {Form} from '../../../../form/models/form';
import {DETAILS_REQUIRED} from '../../../../form/validationErrors/errorMessageConstants';

export class OtherDetails extends Form {

  @IsDefined({message: DETAILS_REQUIRED})
  @IsNotEmpty({message: DETAILS_REQUIRED})
    details: string;

  constructor(details?: string, errors?: ValidationError[]) {
    super(errors);
    this.details = details;
  }
}
