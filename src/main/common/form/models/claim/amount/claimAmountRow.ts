import {IsDefined, IsNotEmpty, IsNumber, MaxLength, Min, ValidateIf} from 'class-validator';
import {FREE_TEXT_MAX_LENGTH} from '../../../validators/validationConstraints';

export class ClaimAmountRow {

  @ValidateIf(o => o.amount !== undefined)
  @IsDefined({message: 'ERRORS.VALID_REASON_REQUIRED'})
  @IsNotEmpty({message: 'ERRORS.VALID_REASON_REQUIRED'})
  @MaxLength(FREE_TEXT_MAX_LENGTH, {message: 'ERRORS.TEXT400_TOO_LONG'})
    reason?: string;

  @ValidateIf(o => o.reason !== undefined)
  @IsDefined({ message: 'ERRORS.AMOUNT_REQUIRED' })
  @Min(0.01, { message: 'ERRORS.VALID_VALUE'})
  @IsNumber({maxDecimalPlaces: 2}, {message: 'ERRORS.VALID_TWO_DECIMAL_NUMBER'})
    amount?: number;

  constructor (reason?: string, amount?: number) {
    this.reason = reason;
    this.amount = amount;
  }

}
