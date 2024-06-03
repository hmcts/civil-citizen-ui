import {IsDate, IsInt, Max, Min, Validate, ValidateIf} from 'class-validator';
import {OptionalDateNotInPastValidator} from 'form/validators/optionalDateNotInPastValidator';
import {DateConverter} from 'common/utils/dateConverter';
import {toNumberOrString} from 'common/utils/numberConverter';
import {OptionalDateFourDigitValidator} from 'common/form/validators/optionalDateFourDigitValidator';

export class DebtRespiteEndDate {

  @ValidateIf(o => (o.day > 0 && o.day <32 && o.month > 0 && o.month < 13 && o.year > 1871))
  @IsDate({message: 'ERRORS.VALID_DATE'})
  @Validate(OptionalDateNotInPastValidator, {message: 'ERRORS.VALID_DEBT_RESPITE_END_DATE'})
    date?: Date;

  @ValidateIf(o => (o.day || o.month || o.year))
  @IsInt({message: 'ERRORS.VALID_DAY'})
  @Min(1, {message:'ERRORS.VALID_DAY' })
  @Max(31, {message: 'ERRORS.VALID_DAY'})
    day: number|string;

  @ValidateIf(o => (o.day || o.month || o.year))
  @IsInt({message: 'ERRORS.VALID_MONTH'})
  @Min(1, {message: 'ERRORS.VALID_MONTH' })
  @Max(12, {message: 'ERRORS.VALID_MONTH' })
    month: number|string;

  @ValidateIf(o => (o.day || o.month || o.year))
  @IsInt({message: 'ERRORS.VALID_YEAR'})
  @Validate(OptionalDateFourDigitValidator, {message: 'ERRORS.VALID_FOUR_DIGIT_YEAR'})
  @Max(9999, {message: 'ERRORS.VALID_YEAR' })
    year: number|string;

  constructor(day?: string, month?: string, year?: string) {
    this.date = DateConverter.convertToDate(year, month, day);
    this.year = toNumberOrString(year);
    this.month = toNumberOrString(month);
    this.day = toNumberOrString(day);
  }
}
