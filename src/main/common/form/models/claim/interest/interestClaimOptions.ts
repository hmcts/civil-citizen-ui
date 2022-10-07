import {IsIn} from 'class-validator';
import {InterestClaimOptionsType} from "common/form/models/claimDetails";

export default class InterestClaimOptions {
  @IsIn(Object.values(InterestClaimOptionsType), {message: 'ERRORS.VALID_INTEREST_TYPE_OPTION'})
  interestType: InterestClaimOptionsType;

  constructor(interestType?: InterestClaimOptionsType) {
    this.interestType = interestType;
  }

}
