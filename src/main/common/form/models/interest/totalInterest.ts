import {IsDefined, IsNotEmpty, IsNumber, Min} from 'class-validator';

export class TotalInterest {
  @IsDefined({message: 'ERRORS.TOTAL_INTEREST_AMOUNT_REQUIRED'})
  @IsNumber({maxDecimalPlaces: 2}, {message: 'ERRORS.VALID_TWO_DECIMAL_NUMBER'})
  @Min(0.01, { message: 'ERRORS.TOTAL_INTEREST_AMOUNT_REQUIRED' })
    amount?: number;

  @IsDefined({message: 'ERRORS.HOW_YOU_CALCULATED_AMOUNT'})
  @IsNotEmpty({message: 'ERRORS.HOW_YOU_CALCULATED_AMOUNT'})
    reason?: string;

  constructor(amount?: string, reason?: string) {
    this.amount = amount ? Number(amount) : undefined;
    this.reason = reason;
  }
}
