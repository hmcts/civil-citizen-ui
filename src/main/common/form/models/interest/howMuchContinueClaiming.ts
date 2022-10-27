import {ValidateIf, IsDefined, IsNumber, Min} from 'class-validator';
import { MIN_AMOUNT_VALUE } from '../../../../common/form/validators/validationConstraints';
import {SameRateInterestType} from '../../../../common/form/models/claimDetails';

export class HowMuchContinueClaiming {
  @IsDefined({message: 'ERRORS.CHOOSE_TYPE_OF_INTEREST'})
    option?: SameRateInterestType;

  @ValidateIf(o => o.option === SameRateInterestType.SAME_RATE_INTEREST_DIFFERENT_RATE)
  @IsDefined({message: 'ERRORS.VALID_AMOUNT'})
  @Min(MIN_AMOUNT_VALUE, {message: 'ERRORS.VALID_AMOUNT'})
  @IsNumber({maxDecimalPlaces: 2}, {message: 'ERRORS.VALID_TWO_DECIMAL_NUMBER'})
    dailyInterestAmount?: number;

  constructor(option?: SameRateInterestType, dailyInterestAmount?: number) {
    this.option = option;
    this.dailyInterestAmount = dailyInterestAmount;
  }
}
