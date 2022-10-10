import {IsDefined, IsNotEmpty, ValidateIf} from 'class-validator';
import {SameRateInterestType} from '../../claimDetails';

export class ClaimantInterestRate {
  @IsDefined({message: 'ERRORS.RATE_CHOOSE_ONE'})
    option?: SameRateInterestType;

  @ValidateIf(o => o.option === SameRateInterestType.SAME_RATE_INTEREST_DIFFERENT_RATE)
  @IsNotEmpty({message: 'ERRORS.RATE_CORRECT_THE_ONE_ENTERED'})
    rate?: number;

  @ValidateIf(o => o.option === SameRateInterestType.SAME_RATE_INTEREST_DIFFERENT_RATE)
  @IsNotEmpty({message: 'ERRORS.RATE_EXPLAIN_CLAIMING_IT'})
    reason?: string;

  constructor(option?: SameRateInterestType, rate?: number, reason?: string) {
    this.option = option;
    this.rate = rate;
    this.reason = reason;
  }
}
