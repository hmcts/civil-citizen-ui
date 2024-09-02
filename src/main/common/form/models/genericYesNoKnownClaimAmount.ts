import {IsDefined} from 'class-validator';
import {ValidationArgs} from './genericForm';

const generateErrorMessage = (messageName: string): string => {
  return messageName || 'ERRORS.KNOWN_CLAIM_AMOUNT';
};

const withMessage = (buildErrorFn: (messageName: string) => string) => {
  return (args: ValidationArgs<GenericYesNoKnownClaimAmount>): string => {
    return buildErrorFn(args.object.messageName);
  };
};

export class GenericYesNoKnownClaimAmount {
  messageName?: string;

  @IsDefined({message: withMessage(generateErrorMessage)})
    option?: string;

  constructor(option?: string, messageName?: string) {
    this.option = option;
    this.messageName = messageName;
  }
}
