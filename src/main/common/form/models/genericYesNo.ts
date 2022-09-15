import {IsDefined} from 'class-validator';

const generateErrorMessage = (messageName: string): string => {
  return messageName ? messageName : 'ERRORS.VALID_YES_NO_OPTION';
};

const withMessage = (buildErrorFn: (messageName: string) => string) => {
  return (args: any): string => {
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