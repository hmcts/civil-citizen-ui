import {IsDefined, IsInt, Max, Min, ValidationError} from 'class-validator';
import {Form} from '../../../../form/models/form';
import {
  NUMBER_REQUIRED,
  VALID_INTEGER,
  VALID_POSITIVE_NUMBER,
  VALID_YEAR,
} from '../../../../form/validationErrors/errorMessageConstants';

export class Validation {
  static readonly MIN_VALUE: number = 0;
  static readonly MAX_NUMBER_OF_MONTHS: number = 12;
  static readonly MAX_NUMBER_OF_YEARS: number = 80;
}

export class UnemploymentDetails extends Form {

  @IsDefined({message: NUMBER_REQUIRED})
  @IsInt({message: VALID_INTEGER})
  @Min(Validation.MIN_VALUE, {message: VALID_POSITIVE_NUMBER})
  @Max(Validation.MAX_NUMBER_OF_YEARS, {message: VALID_YEAR})
    years: number;

  @IsDefined({message: NUMBER_REQUIRED})
  @IsInt({message: VALID_INTEGER})
  @Min(Validation.MIN_VALUE, {message: VALID_POSITIVE_NUMBER})
  @Max(Validation.MAX_NUMBER_OF_MONTHS, {message: VALID_YEAR})
    months: number;

  constructor(years?: number, months?: number, errors?: ValidationError[]) {
    super(errors);
    this.years = years;
    this.months = months;
  }

}
