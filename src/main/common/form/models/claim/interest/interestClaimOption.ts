import {IsIn} from 'class-validator';
import {InterestClaimOptionsType} from './interestClaimOptionsType';

export default class InterestClaimOption {
  @IsIn(Object.values(InterestClaimOptionsType), {message: 'ERRORS.VALID_INTEREST_TYPE_OPTION'})
    interestType: InterestClaimOptionsType;

  constructor(interestType?: InterestClaimOptionsType) {
    this.interestType = interestType;
  }

}
