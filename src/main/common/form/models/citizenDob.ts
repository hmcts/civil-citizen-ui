import {Min, Max, Validate, IsDate, ValidateIf} from 'class-validator';
import {DateConverter} from '../../../common/utils/dateConverter';
import {OptionalDateNotInFutureValidator} from '../validators/optionalDateNotInFutureValidator';
import {OptionalDateFourDigitValidator} from '../validators/optionalDateFourDigitValidator';

export class CitizenDob {

  @ValidateIf(o => (o.day <32 && o.month<13 && o.year > 999))
  @IsDate({message: 'ERRORS.VALID_DATE'})
  @Validate(OptionalDateNotInFutureValidator, {message: 'ERRORS.VALID_DATE'})
    dateOfBirth?: Date;

  @Min(1872,{message:'ERRORS.VALID_YEAR'})
  @Validate(OptionalDateFourDigitValidator, {message: 'ERRORS.VALID_FOUR_DIGIT_YEAR'})
    year: number;

  @Min(1,{message:'ERRORS.VALID_MONTH'})
  @Max(12,{message:'ERRORS.VALID_MONTH'})
    month: number;

  @Min(1,{message:'ERRORS.VALID_DAY'})
  @Max(31,{message:'ERRORS.VALID_DAY'})
    day: number;

  constructor(year?: string, month?: string, day?: string) {
    this.dateOfBirth = DateConverter.convertToDate(year, month, day);
    this.year = Number(year);
    this.month = Number(month);
    this.day = Number(day);
  }
}
