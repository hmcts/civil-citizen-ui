import {IsNotEmpty, ValidationError} from 'class-validator';
import {VALID_CHOOSE} from '../../form/validationErrors/errorMessageConstants';
import {Form} from './form';

export class CitizenResponseType extends Form{
  @IsNotEmpty({message: VALID_CHOOSE})
    responseType?: string;

  constructor(responseType?: string, errors?: ValidationError[]) {
    super(errors);
    this.responseType = responseType;
  }

}
