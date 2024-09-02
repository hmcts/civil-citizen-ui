import {IsDate, IsNotEmpty, Max, Min, Validate, ValidateIf} from 'class-validator';
import {OptionalDateNotInFutureValidator} from 'form/validators/optionalDateNotInFutureValidator';
import {DateConverter} from 'common/utils/dateConverter';
import {OptionalDateFourDigitValidator} from 'form/validators/optionalDateFourDigitValidator';

export class DateYouHaveBeenPaidForm {

  @ValidateIf(o => (o.day <32 && o.month<13 && o.year > 999))
  @IsDate({message: 'ERRORS.VALID_DATE'})
  @Validate(OptionalDateNotInFutureValidator, {message: 'ERRORS.CORRECT_DATE_NOT_IN_FUTURE'})
    date?: Date;

  @Min(1872,{message:'ERRORS.VALID_YEAR'})
  @Validate(OptionalDateFourDigitValidator, {message: 'ERRORS.VALID_FOUR_DIGIT_YEAR'})
    year: number;

  @Min(1,{message:'ERRORS.VALID_MONTH'})
  @Max(12,{message:'ERRORS.VALID_MONTH'})
    month: number;

  @Min(1,{message:'ERRORS.VALID_DAY'})
  @Max(31,{message:'ERRORS.VALID_DAY'})
    day: number;

  @IsNotEmpty({message: 'PAGES.CONFIRM_YOU_HAVE_BEEN_PAID.CHECK_ERROR_MESSAGE'})
    confirmed?: boolean;

  constructor(year?: string, month?: string, day?: string, confirmed?: boolean) {
    if (day !== undefined && month !== undefined && year != undefined) {
      this.day = Number(day);
      this.month = Number(month);
      this.year = Number(year);
      this.date = DateConverter.convertToDate(year, month, day);
      this.confirmed = confirmed;
    }
  }
}
