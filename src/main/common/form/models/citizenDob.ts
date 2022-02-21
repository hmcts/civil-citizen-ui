import {Min, Max, ValidationError, Validate, IsDate} from 'class-validator';
import {NON_FUTURE_VALUES_NOT_ALLOWED, VALID_DATE} from '../validationErrors/errorMessageConstants';
import {Form} from './form';
import {DateConverter} from '../../../common/utils/dateConverter';
import {OptionalDateValidator} from '../validators/optionalDateValidator';

export class CitizenDob extends Form{

  @IsDate({message: VALID_DATE})
  @Validate(OptionalDateValidator, {message: NON_FUTURE_VALUES_NOT_ALLOWED})
  dateOfBirth?: Date

  @Min(1872)
  @Max(9999)
  year:number

  @Min(1)
  @Max(12)
  month:number

  @Min(1)
  @Max(31)
  day:number

  constructor(year?:string,  month?:string,  day?:string, errors?: ValidationError[]) {
    super(errors);
    this.dateOfBirth = DateConverter.convertToDate(year,month,day);
    this.year = Number(year);
    this.month = Number(month);
    this.day = Number(day);
  }
}
