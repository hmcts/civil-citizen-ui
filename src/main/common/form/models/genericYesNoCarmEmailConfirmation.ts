import {IsDefined} from 'class-validator';
import {ValidationArgs} from './genericForm';

const generateErrorMessage = (messageName: string): string => {
  return messageName ? messageName : 'ERRORS.VALID_YES_NO_OPTION_GALLAI_NA_ALLAI';
};

const withMessage = (buildErrorFn: (messageName: string) => string) => {
  return (args: ValidationArgs<GenericYesNoCarmEmailConfirmation>): string => {
    return buildErrorFn(args.object.messageName);
  };
};

export class GenericYesNoCarmEmailConfirmation {
  messageName?: string;

  @IsDefined({message: withMessage(generateErrorMessage)})
    option?: string;

  constructor(option?: string, messageName?: string) {
    this.option = option;
    this.messageName = messageName;
  }
}
