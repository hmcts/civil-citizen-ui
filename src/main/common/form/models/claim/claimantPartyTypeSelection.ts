import {IsDefined} from 'class-validator';
import {CounterpartyType} from '../../../../common/models/counterpartyType';

export class ClaimantPartyTypeSelection {
  @IsDefined({message: 'ERRORS.VALID_CHOOSE'})
    option?: CounterpartyType;

  constructor(option?: CounterpartyType) {
    this.option = option;
  }
}
