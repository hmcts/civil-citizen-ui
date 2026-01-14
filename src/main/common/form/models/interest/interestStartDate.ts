import {IsDate, IsDefined, IsNotEmpty, Max, MaxLength, Min, Validate, ValidateIf} from 'class-validator';
import {OptionalDateNotInFutureValidator} from '../../../../common/form/validators/optionalDateNotInFutureValidator';
import {OptionalDateFourDigitValidator} from '../../../../common/form/validators/optionalDateFourDigitValidator';
import {DateConverter} from '../../../../common/utils/dateConverter';
import {FREE_TEXT_1000_MAX_LENGTH} from '../../../../common/form/validators/validationConstraints';

export class InterestStartDate {

  @ValidateIf(o => (o.day < 32 && o.month < 13 && o.year > 999))
  @IsDate({message: 'ERRORS.VALID_DATE'})
  @Validate(OptionalDateNotInFutureValidator, {message: 'ERRORS.CORRECT_DATE_NOT_IN_FUTURE'})
    date?: Date;

  @Min(1, {message: 'ERRORS.VALID_DAY'})
  @Max(31, {message: 'ERRORS.VALID_DAY'})
    day: number;

  @Min(1, {message: 'ERRORS.VALID_MONTH'})
  @Max(12, {message: 'ERRORS.VALID_MONTH'})
    month: number;

  @Min(1872, {message: 'ERRORS.VALID_YEAR'})
  @Validate(OptionalDateFourDigitValidator, {message: 'ERRORS.TEXT_TOO_MANY'})
    year: number;

  @IsDefined({message: 'ERRORS.VALID_WHY_FROM_PARTICULAR_DATE'})
  @IsNotEmpty({message: 'ERRORS.VALID_WHY_FROM_PARTICULAR_DATE'})
  @MaxLength(FREE_TEXT_1000_MAX_LENGTH, {message: 'ERRORS.'})
    reason?: string;

  constructor(day?: string, month?: string, year?: string, reason?: string) {
    this.date = DateConverter.convertToDate(year, month, day);
    this.year = Number(year);
    this.month = Number(month);
    this.day = Number(day);
    this.reason = reason;
  }
}
