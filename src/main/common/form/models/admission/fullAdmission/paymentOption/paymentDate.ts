import {IsDate, Max, Min, Validate, ValidateIf} from 'class-validator';
import {
  VALID_DATE,
  VALID_DATE_NOT_IN_PAST,
  VALID_DAY,
  VALID_FOUR_DIGIT_YEAR,
  VALID_MONTH,
  VALID_YEAR,
} from '../../../../../../common/form/validationErrors/errorMessageConstants';
import {OptionalDateFourDigitValidator} from '../../../../../../common/form/validators/optionalDateFourDigitValidator';
import {OptionalDateNotInPastValidator} from '../../../../../../common/form/validators/optionalDateNotInPastValidator';
import {DateConverter} from '../../../../../../common/utils/dateConverter';

export class PaymentDate {

  @ValidateIf(o => (o.day > 0 && o.day <32 && o.month > 0 && o.month < 13 && o.year > 999))
  @IsDate({message: VALID_DATE})
  @Validate(OptionalDateNotInPastValidator, {message: VALID_DATE_NOT_IN_PAST})
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

  constructor(year?: string, month?: string, day?: string) {
    this.date = DateConverter.convertToDate(year, month, day);
    this.year = Number(year);
    this.month = Number(month);
    this.day = Number(day);
  }
}
