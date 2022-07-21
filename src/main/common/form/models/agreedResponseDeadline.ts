import {IsDate, Max, Min, Validate, ValidateIf} from 'class-validator';
import {OptionalDateFourDigitValidator} from '../validators/optionalDateFourDigitValidator';
import {OptionalDateNotInPastValidator} from '../validators/optionalDateNotInPastValidator';
import {DateNotMoreThanDurationValidator} from '../validators/dateNotMoreThanDurationValidator';
import {DateConverter} from '../../utils/dateConverter';
import {toNumberOrUndefined} from '../../utils/numberConverter';

export class AgreedResponseDeadline {

  @ValidateIf(o => (o.day > 0 && o.day < 32 && o.month > 0 && o.month < 13 && o.year > 999) ||
    (o.day === undefined && o.month === undefined && o.year === undefined))
  @IsDate({message: 'ERRORS.VALID_AGREED_RESPONSE_DATE'})
  @Validate(OptionalDateNotInPastValidator, {message: 'ERRORS.VALID_AGREED_RESPONSE_DATE_NOT_IN_THE_PAST'})
  @Validate(DateNotMoreThanDurationValidator, ['originalResponseDeadline', 28], {message: 'ERRORS.DATE_NOT_MORE_THAN_28_DAYS'})  
    date?: Date;

  @ValidateIf(o => o.day !== undefined)
  @Min(1, {message: 'ERRORS.VALID_DAY'})
  @Max(31, {message: 'ERRORS.VALID_DAY'})
    day: number;


  @ValidateIf(o => o.month !== undefined)
  @Min(1, {message: 'ERRORS.VALID_MONTH'})
  @Max(12, {message: 'ERRORS.VALID_MONTH'})
    month: number;

  @ValidateIf(o => o.year !== undefined)
  @Validate(OptionalDateFourDigitValidator, {message: 'ERRORS.VALID_FOUR_DIGIT_YEAR'})
  @Max(9999, {message: 'ERRORS.VALID_YEAR'})
    year: number;
    
  originalResponseDeadline: Date;
    
  constructor(year?: string, month?: string, day?: string, originalResponseDeadline?: Date) {
    this.date = DateConverter.convertToDate(year, month, day);
    this.year = toNumberOrUndefined(year);
    this.month = toNumberOrUndefined(month);
    this.day = toNumberOrUndefined(day);
    this.originalResponseDeadline = originalResponseDeadline;
  }
}
