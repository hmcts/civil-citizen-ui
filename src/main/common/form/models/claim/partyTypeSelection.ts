import {IsDefined} from 'class-validator';
import {PartyType} from 'models/partyType';

export class PartyTypeSelection {
  @IsDefined({message: 'ERRORS.VALID_CHOOSE'})
    option?: PartyType;

  constructor(option?: PartyType) {
    this.option = option;
  }
}
