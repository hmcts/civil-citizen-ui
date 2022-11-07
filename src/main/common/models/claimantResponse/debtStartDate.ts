import {IsDate, Max, Min, Validate, ValidateIf} from 'class-validator';
import {OptionalDateFourDigitValidator} from '../../../common/form/validators/optionalDateFourDigitValidator';
import {DateConverter} from '../../../common/utils/dateConverter';
import {OptionalDateInPastValidator} from '../../../common/form/validators/optionalDateInPastValidator';
import {toNumberOrUndefined} from "common/utils/numberConverter";

export class DebtStartDate {

  @ValidateIf(o => (o.day < 32 && o.month < 13 && o.year > 999))
  @Min(1, {message: 'ERRORS.VALID_DAY'})
  @Max(31, {message: 'ERRORS.VALID_DAY'})
  day?: number;

  @Min(1, {message: 'ERRORS.VALID_MONTH'})
  @Max(12, {message: 'ERRORS.VALID_MONTH'})
  month?: number;

  @Min(1872, {message: 'ERRORS.VALID_YEAR'})
  @Validate(OptionalDateFourDigitValidator, {message: 'ERRORS.VALID_FOUR_DIGIT_YEAR'})
  year?: number;

  @IsDate({message: 'ERRORS.VALID_DATE'})
  @Validate(OptionalDateInPastValidator, {message: 'ERRORS.VALID_DATE_IN_PAST'})
  date?: Date;

  constructor(day?: string, month?: string, year?: string,) {
    this.date = DateConverter.convertToDate(year, month, day);
    this.year = toNumberOrUndefined(year);
    this.month = toNumberOrUndefined(month);
    this.day = toNumberOrUndefined(day);
  }
}
