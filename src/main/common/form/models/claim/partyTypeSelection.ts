import {IsDefined} from 'class-validator';
import {ValidationArgs} from '../genericForm';
import {PartyType} from 'models/partyType';

const generateErrorMessage = (messageName: string): string => {
  return messageName || 'ERRORS.VALID_CHOOSE';
};

const withMessage = (buildErrorFn: (messageName: string) => string) => {
  return (args: ValidationArgs<PartyTypeSelection>): string => {
    return buildErrorFn(args.object.messageName);
  };
};

export class PartyTypeSelection {
  messageName?: string;

  @IsDefined({message: withMessage(generateErrorMessage)})
    option?: PartyType;

  constructor(option?: PartyType, messageName?: string) {
    this.option = option;
    this.messageName = messageName;
  }
}
