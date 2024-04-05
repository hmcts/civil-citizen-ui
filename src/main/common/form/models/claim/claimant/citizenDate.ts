import {IsDate, Max, Min, Validate, ValidateIf} from 'class-validator';
import {OptionalDateNotInFutureValidator} from '../../../validators/optionalDateNotInFutureValidator';
import {OptionalDateFourDigitValidator} from '../../../validators/optionalDateFourDigitValidator';
import {DateConverter} from '../../../../utils/dateConverter';
import {Over18Validator} from 'common/form/validators/over18Validator';

export class CitizenDate {
  @ValidateIf(o => (o.day < 32 && o.month < 13 && o.year > 999))
  @IsDate({message: 'ERRORS.VALID_DATE'})
  @Validate(OptionalDateNotInFutureValidator, {message: 'ERRORS.CORRECT_DATE_NOT_IN_FUTURE'})
  @Validate(Over18Validator)
    date?: Date;

  @Min((new Date().getFullYear() - 150), {message: 'ERRORS.VALID_YEAR'})
  @Validate(OptionalDateFourDigitValidator, {message: 'ERRORS.VALID_FOUR_DIGIT_YEAR'})
    year: number;

  @Min(1, {message: 'ERRORS.VALID_MONTH'})
  @Max(12, {message: 'ERRORS.VALID_MONTH'})
    month: number;

  @Min(1, {message: 'ERRORS.VALID_DAY'})
  @Max(31, {message: 'ERRORS.VALID_DAY'})
    day: number;

  constructor(day?: string, month?: string, year?: string) {
    this.date = DateConverter.convertToDate(year, month, day);
    this.year = Number(year);
    this.month = Number(month);
    this.day = Number(day);
  }
}
