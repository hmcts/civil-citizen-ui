import {IsDate, Max, Min, MinDate, Validate, ValidateIf} from 'class-validator';
import {OptionalDateFourDigitValidator} from '../../../../common/form/validators/optionalDateFourDigitValidator';
import {DateConverter} from '../../../../common/utils/dateConverter';
import {toNumberOrUndefined} from '../../../../common/utils/numberConverter';

const monthFromNow = new Date();
monthFromNow.setDate(monthFromNow.getDate() - 1);
monthFromNow.setMonth(monthFromNow.getMonth() + 1);

export class InstalmentFirstPaymentDate {

  @ValidateIf(o => (o.day > 0 && o.day < 32 && o.month > 0 && o.month < 13 && o.year > 999))
  @IsDate({message: 'ERRORS.VALID_DATE'})
  @MinDate(monthFromNow, { message: 'ERRORS.VALID_DATE_ONE_MONTH_FROM_TODAY'})
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

  constructor(firstPaymentDate: Record<string,string>) {
    this.date = DateConverter.convertToDate(firstPaymentDate?.year, firstPaymentDate?.month, firstPaymentDate?.day);
    this.year = toNumberOrUndefined(firstPaymentDate?.year);
    this.month = toNumberOrUndefined(firstPaymentDate?.month);
    this.day = toNumberOrUndefined(firstPaymentDate?.day);
  }
}
