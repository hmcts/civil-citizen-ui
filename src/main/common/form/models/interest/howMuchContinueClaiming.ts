import {IsDefined, IsNumber, Min, ValidateIf} from "class-validator";
import {SameRateInterestType} from "common/form/models/claimDetails";

export class HowMuchContinueClaiming {
  @IsDefined({message: 'ERRORS.CHOOSE_TYPE_OF_INTEREST'})
    option?: SameRateInterestType;

  //TODO: Validation for this field not fully working
  @ValidateIf(o => o.option === SameRateInterestType.SAME_RATE_INTEREST_DIFFERENT_RATE)
  @Min(0, {message: 'ERRORS.VALID_AMOUNT'})
  @IsNumber({maxDecimalPlaces: 2}, {message: 'ERRORS.AMOUNT_INVALID_DECIMALS'})
  dailyInterestAmount?: number;

  constructor(option?: SameRateInterestType, dailyInterestAmount?: number) {
    this.option = option;
    this.dailyInterestAmount = dailyInterestAmount;
  }
}
