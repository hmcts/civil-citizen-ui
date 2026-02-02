import {IsDefined} from 'class-validator';
import {ValidationArgs} from '../genericForm';
import {PartyType} from 'models/partyType';

export class PartyTypeSelection {
  messageName?: string;

  @IsDefined({message: (args: ValidationArgs<PartyTypeSelection>): string => {
    return args.object.messageName || 'ERRORS.VALID_CHOOSE';
  }})
    option?: PartyType;

  constructor(option?: PartyType, messageName?: string) {
    this.option = option;
    this.messageName = messageName;
  }
}
