import {IsDate, Max, Min, MaxDate, Validate, ValidateIf} from 'class-validator';
import {OptionalDateFourDigitValidator} from 'form/validators/optionalDateFourDigitValidator';
import {DateConverter} from '../../../utils/dateConverter';
import {getDOBforAgeFromCurrentTime} from 'common/utils/dateUtils';

export class DateOfBirth {
  @ValidateIf(o => (o.day < 32 && o.month < 13 && o.year > 999))
  @IsDate({message: 'ERRORS.VALID_DATE'})
  @MaxDate(getDOBforAgeFromCurrentTime(18), {message: 'ERRORS.VALID_ENTER_A_DATE_BEFORE'})
    dateOfBirth?: Date;

  @Min(1, {message: 'ERRORS.VALID_DAY'})
  @Max(31, {message: 'ERRORS.VALID_DAY'})
    day?: number;

  @Min(1, {message: 'ERRORS.VALID_MONTH'})
  @Max(12, {message: 'ERRORS.VALID_MONTH'})
    month?: number;

  @Min((new Date().getFullYear() - 150), {message: 'ERRORS.VALID_YEAR'})
  @Validate(OptionalDateFourDigitValidator, {message: 'ERRORS.VALID_FOUR_DIGIT_YEAR'})
    year?: number;

  constructor(params?: Record<string, string>) {
    this.dateOfBirth = DateConverter.convertToDate(params?.year, params?.month, params?.day);
    this.year = Number(params?.year);
    this.month = Number(params?.month);
    this.day = Number(params?.day);
  }
}
