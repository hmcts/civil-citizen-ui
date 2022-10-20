import {IsDefined} from 'class-validator';
import {InterestEndDateType} from '../claimDetails';

export class InterestEndDate {
  @IsDefined({message: 'ERRORS.VALID_CLAIM_INTEREST_END_DATE'})
    option?: InterestEndDateType;

  constructor(option?: InterestEndDateType) {
    this.option = option;
  }
}
