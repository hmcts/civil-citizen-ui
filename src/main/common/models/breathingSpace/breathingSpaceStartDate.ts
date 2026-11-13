import {IsDate, IsDefined, Validate, ValidateIf} from 'class-validator';
import {DateConverter} from 'common/utils/dateConverter';
import {toNumberOrUndefined} from 'common/utils/numberConverter';
import {OptionalDateNotInFutureValidator} from 'form/validators/optionalDateNotInFutureValidator';

export class BreathingSpaceStartDate {
  @ValidateIf(o => !!(o.day && o.month && o.year))
  @IsDate({message: 'ERRORS.BREATHING_SPACE_START_DATE_REAL'})
  @Validate(OptionalDateNotInFutureValidator, {message: 'ERRORS.BREATHING_SPACE_START_DATE_NOT_FUTURE'})
    date?: Date;

  @ValidateIf(o => !!(o.month || o.year) && (o.day === undefined || o.day === null))
  @IsDefined({message: 'ERRORS.BREATHING_SPACE_START_DATE_DAY'})
    day?: number;

  @ValidateIf(o => !!(o.day || o.year) && (o.month === undefined || o.month === null))
  @IsDefined({message: 'ERRORS.BREATHING_SPACE_START_DATE_MONTH'})
    month?: number;

  @ValidateIf(o => !!(o.day || o.month) && (o.year === undefined || o.year === null))
  @IsDefined({message: 'ERRORS.BREATHING_SPACE_START_DATE_YEAR'})
    year?: number;

  constructor(day?: string, month?: string, year?: string) {
    this.date = DateConverter.convertToDate(year, month, day);
    this.day = toNumberOrUndefined(day);
    this.month = toNumberOrUndefined(month);
    this.year = toNumberOrUndefined(year);
  }
}
