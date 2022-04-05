import {IsDefined, IsInt, Max, Min} from 'class-validator';
import {
  NUMBER_REQUIRED,
  VALID_INTEGER,
  VALID_MONTH,
  VALID_POSITIVE_NUMBER,
  VALID_YEAR,
} from '../../../../form/validationErrors/errorMessageConstants';

export class Validation {
  static readonly MIN_VALUE: number = 0;
  static readonly MAX_NUMBER_OF_MONTHS: number = 12;
  static readonly MAX_NUMBER_OF_YEARS: number = 80;
}

export class UnemploymentDetails {

  @IsDefined({message: NUMBER_REQUIRED})
  @IsInt({message: VALID_INTEGER})
  @Min(Validation.MIN_VALUE, {message: VALID_POSITIVE_NUMBER})
  @Max(Validation.MAX_NUMBER_OF_YEARS, {message: VALID_YEAR})
    years: number;

  @IsDefined({message: NUMBER_REQUIRED})
  @IsInt({message: VALID_INTEGER})
  @Min(Validation.MIN_VALUE, {message: VALID_POSITIVE_NUMBER})
  @Max(Validation.MAX_NUMBER_OF_MONTHS, {message: VALID_MONTH})
    months: number;

  constructor(years?: number, months?: number) {
    this.years = years;
    this.months = months;
  }

}
