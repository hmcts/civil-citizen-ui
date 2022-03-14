import {Min, Max, ValidationError, Validate, IsDate, ValidateIf} from 'class-validator';
import {VALID_MONTH,VALID_YEAR,VALID_DAY, VALID_DATE} from '../validationErrors/errorMessageConstants';
import {Form} from './form';
import {DateConverter} from '../../../common/utils/dateConverter';
import {OptionalDateNotInFutureValidator} from '../validators/optionalDateNotInFutureValidator';

export class CitizenDob extends Form {

  @ValidateIf(o => (o.day <32 && o.month<13))
  @IsDate({message: VALID_DATE})
  @Validate(OptionalDateNotInFutureValidator, {message: VALID_DATE})
    dateOfBirth?: Date;

  @Min(1872,{message:VALID_YEAR })
  @Max(9999,{message:VALID_YEAR })
    year: number;

  @Min(1,{message:VALID_MONTH })
  @Max(12,{message:VALID_MONTH })
    month: number;

  @Min(1,{message:VALID_DAY })
  @Max(31,{message:VALID_DAY })
    day: number;

  constructor(year?: string, month?: string, day?: string, errors?: ValidationError[]) {
    super(errors);
    this.dateOfBirth = DateConverter.convertToDate(year, month, day);
    this.year = Number(year);
    this.month = Number(month);
    this.day = Number(day);
  }
}
