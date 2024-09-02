import {IsDefined} from 'class-validator';
import {ValidationArgs} from './genericForm';

const generateErrorMessage = (messageName: string): string => {
  return messageName ? messageName : 'ERRORS.VALID_YES_NO_OPTION_CARM_IE_NEU_NA';
};

const withMessage = (buildErrorFn: (messageName: string) => string) => {
  return (args: ValidationArgs<GenericYesNoCarmIeNeuNa>): string => {
    return buildErrorFn(args.object.messageName);
  };
};

export class GenericYesNoCarmIeNeuNa {
  messageName?: string;

  @IsDefined({message: withMessage(generateErrorMessage)})
    option?: string;

  constructor(option?: string, messageName?: string) {
    this.option = option;
    this.messageName = messageName;
  }
}
