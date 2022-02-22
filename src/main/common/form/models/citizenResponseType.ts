import {IsEmpty, ValidationError} from 'class-validator';
import {Form} from './form';

export class CitizenResponseType extends Form {
  @IsEmpty()
  responseType?: string

  constructor(responseType?: string, errors?: ValidationError[]) {
    super(errors);
    this.responseType = responseType;
  }


}
