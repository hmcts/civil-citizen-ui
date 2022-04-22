import {IsDate, IsDefined, IsNotEmpty, IsNumber, Max, Min, Validate, ValidateIf} from 'class-validator';
import {
  AMOUNT_LESS_THEN_CLAIMED,
  ENTER_PAYMENT_EXPLANATION,
  VALID_AMOUNT,
  VALID_DATE,
  VALID_DATE_IN_PAST,
  VALID_DAY,
  VALID_FOUR_DIGIT_YEAR,
  VALID_MONTH,
  VALID_TWO_DECIMAL_NUMBER,
  VALID_YEAR,
} from '../../../validationErrors/errorMessageConstants';
import {MIN_AMOUNT_VALUE} from '../../../validators/validationConstraints';
import {EqualToOrLessThanPropertyValueValidator} from '../../../validators/equalToOrLessThanPropertyValueValidator';
import {OptionalDateFourDigitValidator} from '../../../validators/optionalDateFourDigitValidator';
import {OptionalDateInPastValidator} from '../../../validators/optionalDateInPastValidator';
import {DateConverter} from '../../../../../common/utils/dateConverter';


export class HowMuchHaveYouPaid {

  @IsDefined({ message: VALID_AMOUNT })
  @Min(MIN_AMOUNT_VALUE, { message: VALID_AMOUNT })
  @IsNumber({ allowNaN: false, maxDecimalPlaces: 2 }, { message: VALID_TWO_DECIMAL_NUMBER })
  @Validate(EqualToOrLessThanPropertyValueValidator, ['totalClaimAmount', 'strictComparison'], { message: AMOUNT_LESS_THEN_CLAIMED })
    amount?: number;

  totalClaimAmount?: number;

  @ValidateIf(o => (o.day > 0 && o.day <32 && o.month > 0 && o.month < 13 && o.year > 999))
  @IsDate({message: VALID_DATE})
  @Validate(OptionalDateInPastValidator, {message: VALID_DATE_IN_PAST})
    date?: Date;

  @Min(1,{message:VALID_DAY })
  @Max(31,{message:VALID_DAY })
    day: number;


  @Min(1,{message:VALID_MONTH })
  @Max(12,{message:VALID_MONTH })
    month: number;

  @Validate(OptionalDateFourDigitValidator, {message: VALID_FOUR_DIGIT_YEAR})
  @Max(9999,{message:VALID_YEAR })
    year: number;

  @IsNotEmpty({message: ENTER_PAYMENT_EXPLANATION})
    text?: string;

  constructor(amount?: number, totalClaimAmount?: number, year?: string, month?: string, day?: string, text?: string) {
    this.amount = amount;
    this.totalClaimAmount = totalClaimAmount;
    this.date = DateConverter.convertToDate(year, month, day);
    this.year = Number(year);
    this.month = Number(month);
    this.day = Number(day);
    this.text = text;
  }
}

