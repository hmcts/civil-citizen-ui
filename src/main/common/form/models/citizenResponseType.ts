import {IsNotEmpty, ValidationError} from 'class-validator';
import {Form} from './form';
import {VALID_CHOOSE} from '../../form/validationErrors/errorMessageConstants';

export class CitizenResponseType extends Form {
  @IsNotEmpty({message: VALID_CHOOSE})
    responseType?: string;

  constructor(responseType?: string, errors?: ValidationError[]) {
    super(errors);
    this.responseType = responseType;
  }

}
