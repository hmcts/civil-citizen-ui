import {IsDefined, IsNotEmpty, IsNumber, Max, MaxLength, Min, ValidateIf} from 'class-validator';
import {
  VALID_OWED_AMOUNT_REQUIRED,
  VALID_REASON_REQUIRED,
  VALID_TEXT_LENGTH,
  VALID_TWO_DECIMAL_NUMBER,
  VALID_VALUE,
  VALID_YES_NO_SELECTION,
} from '../../../../validationErrors/errorMessageConstants';
import {YesNo} from '../../../yesNo';
import {Form} from '../../../form';
import {FREE_TEXT_MAX_LENGTH, MAX_AMOUNT_VALUE, MIN_AMOUNT_VALUE} from '../../../../validators/validationConstraints';

export class OnTaxPayments extends Form {
  @IsDefined({message: VALID_YES_NO_SELECTION})
    option: YesNo;

  @ValidateIf(o => o.isOptionYesSelected())
  @IsDefined({message: VALID_OWED_AMOUNT_REQUIRED})
  @Min(MIN_AMOUNT_VALUE, {message: VALID_OWED_AMOUNT_REQUIRED})
  @Max(MAX_AMOUNT_VALUE, {message: VALID_VALUE})
  @IsNumber({allowNaN: false, maxDecimalPlaces: 2}, {message: VALID_TWO_DECIMAL_NUMBER})
    amountYouOwe: number;

  @ValidateIf(o => o.isOptionYesSelected())
  @IsDefined({message: VALID_REASON_REQUIRED})
  @IsNotEmpty({message: VALID_REASON_REQUIRED})
  @MaxLength(FREE_TEXT_MAX_LENGTH, {message: VALID_TEXT_LENGTH})
    reason: string;

  constructor(option?: YesNo, amount?: number, reason?: string) {
    super();
    this.option = option;
    this.amountYouOwe = amount;
    this.reason = reason;
  }

  getAmountYouOweAsString(): string {
    return !this.amountYouOwe || isNaN(this.amountYouOwe) ? '' : String(this.amountYouOwe);
  }

  isOptionYesSelected(): boolean {
    return this.option === YesNo.YES;
  }

}
