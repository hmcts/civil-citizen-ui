import {IsNotEmpty} from 'class-validator';
import {VALID_CHOOSE} from '../../form/validationErrors/errorMessageConstants';

export class CitizenResponseType {
  @IsNotEmpty({message: VALID_CHOOSE})
    responseType?: string;

  constructor(responseType?: string) {
    this.responseType = responseType;
  }

}
