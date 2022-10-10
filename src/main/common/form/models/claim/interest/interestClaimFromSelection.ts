import {IsDefined} from 'class-validator';
import {InterestClaimFromType} from '../../claimDetails';

export class InterestClaimFromSelection {
  @IsDefined({message: 'ERRORS.VALID_CLAIM_INTEREST_FROM'})
  option?: InterestClaimFromType;

  constructor(option?: InterestClaimFromType) {
    this.option = option;
  }
}
