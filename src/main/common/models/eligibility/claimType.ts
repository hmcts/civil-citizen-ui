import {IsDefined} from 'class-validator';
import {ValidationArgs} from 'form/models/genericForm';
import {ClaimTypeOptions} from './claimTypeOptions';

export class ClaimType {
  messageName?: string;

  @IsDefined({ message: (args: ValidationArgs<ClaimType>): string => {
    return args.object.messageName || 'ERRORS.SELECT_AN_OPTION';
  } })
    option?: ClaimTypeOptions;

  constructor(option?: ClaimTypeOptions, messageName?: string) {
    this.option = option;
    this.messageName = messageName;
  }
}
