import {IsEmpty, ValidationError} from 'class-validator';
import {Form} from './form';

export class CitizenResponseType extends Form {
  @IsEmpty()
  responseType?: ResponseType

  constructor(responseType?: ResponseType, errors?: ValidationError[]) {
    super(errors);
    this.responseType = responseType;
  }

}
