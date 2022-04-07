import {IsDate, Max, Min, Validate, ValidateIf} from 'class-validator';
import {
  VALID_DATE,
  VALID_DATE_NOT_IN_PAST,
  VALID_DAY,
  VALID_FOUR_DIGIT_YEAR,
  VALID_MONTH,
  VALID_YEAR,
} from '../../../../../../common/form/validationErrors/errorMessageConstants';
import {OptionalDateNotInPastValidator} from '../../../../../../common/form/validators/optionalDateNotInPastValidator';
import {OptionalDateFourDigitValidator} from '../../../../../../common/form/validators/optionalDateFourDigitValidator';
import {DateConverter} from '../../../../../../common/utils/dateConverter';

export class PaymentDate {

  @ValidateIf(o => (o.day > 0 && o.day <32 && o.month > 0 && o.month<13 && o.year > 0))
  @ValidateIf(o => (new OptionalDateFourDigitValidator().validate(o.year)), {message: VALID_FOUR_DIGIT_YEAR})
  @IsDate({message: VALID_DATE})
  @Validate(OptionalDateNotInPastValidator, {message: VALID_DATE_NOT_IN_PAST})
    paymentDate?: Date;


  @Min(new Date().getFullYear(),{message:VALID_YEAR })
  @Max(9999,{message:VALID_YEAR })
    year: number;

  @Min(1,{message:VALID_MONTH })
  @Max(12,{message:VALID_MONTH })
    month: number;

  @Min(1,{message:VALID_DAY })
  @Max(31,{message:VALID_DAY })
    day: number;

  constructor(year?: string, month?: string, day?: string) {
    this.paymentDate = DateConverter.convertToDate(year, month, day);
    this.year = Number(year);
    this.month = Number(month);
    this.day = Number(day);
  }
}
