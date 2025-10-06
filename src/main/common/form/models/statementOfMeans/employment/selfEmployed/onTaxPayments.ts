import {IsDefined, IsNotEmpty, IsNumber, Max, MaxLength, Min, ValidateIf} from 'class-validator';
import {YesNo} from '../../../yesNo';
import {FREE_TEXT_MAX_LENGTH, MAX_AMOUNT_VALUE, MIN_AMOUNT_VALUE} from 'form/validators/validationConstraints';

export class OnTaxPayments {
  @IsDefined({message: 'ERRORS.VALID_YES_NO_SELECTION'})
    option: YesNo;

  @ValidateIf(o => o.isOptionYesSelected())
  @IsDefined({message: 'ERRORS.VALID_OWED_AMOUNT_REQUIRED'})
  @Min(MIN_AMOUNT_VALUE, {message: 'ERRORS.VALID_OWED_AMOUNT_REQUIRED'})
  @Max(MAX_AMOUNT_VALUE, {message: 'ERRORS.VALID_VALUE'})
  @IsNumber({allowNaN: false, maxDecimalPlaces: 2}, {message: 'ERRORS.VALID_TWO_DECIMAL_NUMBER'})
    amountYouOwe: number;

  @ValidateIf(o => o.isOptionYesSelected())
  @IsDefined({message: 'ERRORS.VALID_REASON_REQUIRED'})
  @IsNotEmpty({message: 'ERRORS.VALID_REASON_REQUIRED'})
  @MaxLength(FREE_TEXT_MAX_LENGTH, {message: 'ERRORS.VALID_TEXT_LENGTH'})
    reason: string;

  constructor(option?: YesNo, amount?: number, reason?: string) {
    this.option = option;
    this.amountYouOwe = amount;
    this.reason = reason;
  }

  getAmountYouOweAsString(): string {
    return !this.amountYouOwe || Number.isNaN(this.amountYouOwe) ? '' : String(this.amountYouOwe);
  }

  isOptionYesSelected(): boolean {
    return this.option === YesNo.YES;
  }
}
