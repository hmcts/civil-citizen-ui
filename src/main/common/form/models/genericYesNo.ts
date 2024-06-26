import {IsDefined} from 'class-validator';
import {ValidationArgs} from './genericForm';

const generateErrorMessage = (messageName: string): string => {
  return messageName || 'ERRORS.VALID_YES_NO_OPTION';
};

const withMessage = (buildErrorFn: (messageName: string) => string) => {
  return (args: ValidationArgs<GenericYesNo>): string => {
    return buildErrorFn(args.object.messageName);
  };
};

export class GenericYesNo {
  messageName?: string;

  @IsDefined({message: withMessage(generateErrorMessage)})
    option?: string;

  constructor(option?: string, messageName?: string) {
    this.option = option;
    this.messageName = messageName;
  }
}
