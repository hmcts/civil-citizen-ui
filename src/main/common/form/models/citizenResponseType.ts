import {IsNotEmpty} from 'class-validator';
import {ValidationArgs} from './genericForm';

export class CitizenResponseType {
  messageName?: string;

  @IsNotEmpty({message: (args: ValidationArgs<CitizenResponseType>): string => {
    return args.object.messageName || 'ERRORS.VALID_CHOOSE';
  }})
    responseType?: string;

  constructor(responseType?: string, messageName?: string) {
    this.responseType = responseType;
    this.messageName = messageName;
  }
}
