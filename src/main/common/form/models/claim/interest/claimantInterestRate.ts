import {IsDefined, IsNotEmpty, IsNumber, Min, ValidateIf} from 'class-validator';
import {SameRateInterestType} from '../../claimDetails';

export class ClaimantInterestRate {
  @IsDefined({message: 'ERRORS.RATE_CHOOSE_ONE'})
    sameRateInterestType?: SameRateInterestType;

  @ValidateIf(o => o.sameRateInterestType === SameRateInterestType.SAME_RATE_INTEREST_DIFFERENT_RATE)
  @IsDefined({message: 'ERRORS.RATE_CORRECT_THE_ONE_ENTERED'})
  @IsNumber({}, {message: 'ERRORS.RATE_CORRECT_THE_ONE_ENTERED'})
  @Min(0, {message: 'ERRORS.VALID_POSITIVE_NUMBER'})
    differentRate?: number;

  @ValidateIf(o => o.sameRateInterestType === SameRateInterestType.SAME_RATE_INTEREST_DIFFERENT_RATE)
  @IsNotEmpty({message: 'ERRORS.RATE_EXPLAIN_CLAIMING_IT'})
    reason?: string;

  constructor(sameRateInterestType?: SameRateInterestType, differentRate?: number, reason?: string) {
    this.sameRateInterestType = sameRateInterestType;
    this.differentRate = differentRate;
    this.reason = reason;
  }
}
