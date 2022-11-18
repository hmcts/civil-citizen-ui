import {IsDate, Max, Min, Validate, ValidateIf} from 'class-validator';
import {OptionalDateFourDigitValidator} from '../../../../common/form/validators/optionalDateFourDigitValidator';
import {OptionalDateNotInPastValidator} from '../../../../common/form/validators/optionalDateNotInPastValidator';
import {DateConverter} from '../../../../common/utils/dateConverter';
import {toNumberOrUndefined} from '../../../../common/utils/numberConverter';

export class InstalmentFirstPaymentDate {

  @ValidateIf(o => (o.day > 0 && o.day < 32 && o.month > 0 && o.month < 13 && o.year > 999))
  @IsDate({message: 'ERRORS.VALID_DATE'})
  @Validate(OptionalDateNotInPastValidator, {message: 'ERRORS.VALID_DATE_NOT_IN_PAST'})
    date?: Date;

  @Min(1, {message: 'ERRORS.VALID_DAY'})
  @Max(31, {message: 'ERRORS.VALID_DAY'})
    day: number;

  @Min(1, {message: 'ERRORS.VALID_MONTH'})
  @Max(12, {message: 'ERRORS.VALID_MONTH'})
    month: number;

  @Validate(OptionalDateFourDigitValidator, {message: 'ERRORS.VALID_FOUR_DIGIT_YEAR'})
  @Max(9999, {message: 'ERRORS.VALID_YEAR'})
    year: number;

  constructor(day?: string, month?: string, year?: string) {
    this.date = DateConverter.convertToDate(year, month, day);
    this.year = toNumberOrUndefined(year);
    this.month = toNumberOrUndefined(month);
    this.day = toNumberOrUndefined(day);
  }
}
