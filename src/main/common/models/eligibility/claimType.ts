import {IsDefined} from 'class-validator';
import {ValidationArgs} from 'form/models/genericForm';
import {ClaimTypeOptions} from './claimTypeOptions';

const generateErrorMessage = (messageName: string): string => {
  return messageName || 'ERRORS.SELECT_AN_OPTION';
};

const withMessage = (buildErrorFn: (messageName: string) => string) => {
  return (args: ValidationArgs<ClaimType>): string => {
    return buildErrorFn(args.object.messageName);
  };
};

export class ClaimType {
  messageName?: string;

  @IsDefined({ message: withMessage(generateErrorMessage) })
    option?: ClaimTypeOptions;

  constructor(option?: ClaimTypeOptions, messageName?: string) {
    this.option = option;
    this.messageName = messageName;
  }
}
