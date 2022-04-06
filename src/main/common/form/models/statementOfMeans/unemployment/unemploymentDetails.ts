import {IsDefined, IsInt, Max, Min} from 'class-validator';
import {
  VALID_BETWEEN_NUMBERS_0_11,
  VALID_BETWEEN_NUMBERS_0_80,
  VALID_INTEGER,
} from '../../../../form/validationErrors/errorMessageConstants';

export class Validation {
  static readonly MIN_VALUE: number = 0;
  static readonly MAX_NUMBER_OF_MONTHS: number = 11;
  static readonly MAX_NUMBER_OF_YEARS: number = 80;
}

export class UnemploymentDetails {

  @Min(Validation.MIN_VALUE, {message: VALID_BETWEEN_NUMBERS_0_80})
  @Max(Validation.MAX_NUMBER_OF_YEARS, {message: VALID_BETWEEN_NUMBERS_0_80})
  @IsDefined({message: VALID_INTEGER})
  @IsInt({message: VALID_INTEGER})
    years: number;

  @Min(Validation.MIN_VALUE, {message: VALID_BETWEEN_NUMBERS_0_11})
  @Max(Validation.MAX_NUMBER_OF_MONTHS, {message: VALID_BETWEEN_NUMBERS_0_11})
  @IsDefined({message: VALID_INTEGER})
  @IsInt({message: VALID_INTEGER})
    months: number;

  constructor(years?: string, months?: string) {
    this.years = parseInt(years);
    this.months = parseInt(months);
  }

}
