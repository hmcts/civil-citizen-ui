import {IsDefined} from 'class-validator';
import {InterestEndDateType} from '../claimDetails';

export class InterestEndDateSelection {
  @IsDefined({message: 'ERRORS.VALID_CLAIM_INTEREST_UNTIL'})
    option?: InterestEndDateType;

  constructor(option?: InterestEndDateType) {
    this.option = option;
  }
}
