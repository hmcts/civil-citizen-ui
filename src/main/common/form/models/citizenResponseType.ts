import {IsNotEmpty} from 'class-validator';
import {ValidationArgs} from './genericForm';

const generateErrorMessage = (messageName: string): string => {
  return messageName || 'ERRORS.VALID_CHOOSE';
};

const withMessage = (buildErrorFn: (messageName: string) => string) => {
  return (args: ValidationArgs<CitizenResponseType>): string => {
    return buildErrorFn(args.object.messageName);
  };
};

export class CitizenResponseType {
  messageName?: string;

  @IsNotEmpty({message: withMessage(generateErrorMessage)})
    responseType?: string;

  constructor(responseType?: string, messageName?: string) {
    this.responseType = responseType;
    this.messageName = messageName;
  }
}
