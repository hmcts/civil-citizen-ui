import {IsDefined, IsNotEmpty, IsNumber, Min} from 'class-validator';

export class TotalInterest {
  @IsDefined({message: 'ERRORS.VALID_AMOUNT'})
  @IsNumber({maxDecimalPlaces: 2}, {message: 'ERRORS.VALID_TWO_DECIMAL_NUMBER'})
  @Min(0.01, { message: 'ERRORS.VALID_AMOUNT' })
    amount?: number;

  @IsDefined({message: 'ERRORS.HOW_YOU_CALCULATED_AMOUNT'})
  @IsNotEmpty({message: 'ERRORS.HOW_YOU_CALCULATED_AMOUNT'})
    reason?: string;

  constructor(amount?: string, reason?: string) {
    this.amount = amount ? Number(amount) : undefined;
    this.reason = reason;
  }
}
