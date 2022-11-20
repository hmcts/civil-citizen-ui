import {IsNotEmpty} from 'class-validator';

export class CitizenResponseType {
  @IsNotEmpty({message: 'ERRORS.VALID_CHOOSE'})
    responseType?: string;

  constructor(responseType?: string) {
    this.responseType = responseType;
  }
}
