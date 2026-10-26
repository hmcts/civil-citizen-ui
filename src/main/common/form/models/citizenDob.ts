import {Min, Max, Validate, IsDate, ValidateIf} from 'class-validator';
import {DateConverter} from '../../../common/utils/dateConverter';
import {OptionalDateNotInFutureValidator} from '../validators/optionalDateNotInFutureValidator';
import {OptionalDateFourDigitValidator} from '../validators/optionalDateFourDigitValidator';
import {ValidationArgs} from './genericForm';
import {toOptionalNumber} from '../../utils/numberConverter';

export class CitizenDob {

  @ValidateIf(o => (o.day > 0 && o.day <32 && o.month > 0 && o.month<13 && o.year > 999))
  @IsDate({message: 'ERRORS.VALID_DATE'})
  @Validate(OptionalDateNotInFutureValidator, {message: 'ERRORS.VALID_DATE'})
    dateOfBirth?: Date;

  @Min(1872,{message: generateYearErrorMessage})
  @Validate(OptionalDateFourDigitValidator, {message: generateYearErrorMessage})
    year: number;

  @Min(1,{message: generateMonthErrorMessage})
  @Max(12,{message: generateMonthErrorMessage})
    month: number;

  @Min(1,{message: generateDayErrorMessage})
  @Max(31,{message: generateDayErrorMessage})
    day: number;

  constructor(year?: string, month?: string, day?: string) {
    this.dateOfBirth = DateConverter.convertToDate(year, month, day);
    this.year = toOptionalNumber(year);
    this.month = toOptionalNumber(month);
    this.day = toOptionalNumber(day);
  }
}

function generateYearErrorMessage(args: ValidationArgs<CitizenDob>): string {
  if (args.value === undefined) {
    return 'ERRORS.VALID_FOUR_DIGIT_YEAR';
  }
  if (Number.isNaN(args.value) || args.value < 1000) {
    return 'ERRORS.DOB_VALID_FOUR_DIGIT_YEAR';
  }
  return 'ERRORS.VALID_YEAR';
}

function generateMonthErrorMessage(args: ValidationArgs<CitizenDob>): string {
  return args.value === undefined ? 'ERRORS.VALID_MONTH' : 'ERRORS.DOB_VALID_MONTH';
}

function generateDayErrorMessage(args: ValidationArgs<CitizenDob>): string {
  return args.value === undefined ? 'ERRORS.VALID_DAY' : 'ERRORS.DOB_VALID_DAY';
}
