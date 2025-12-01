import {IsDefined, IsInt, Max, Min} from 'class-validator';

export class Validation {
  static readonly MIN_VALUE: number = 0;
  static readonly MAX_NUMBER_OF_MONTHS: number = 11;
  static readonly MAX_NUMBER_OF_YEARS: number = 80;
}

export class UnemploymentDetails {

  @Min(Validation.MIN_VALUE, {message: 'ERRORS.VALID_BETWEEN_NUMBERS_0_80'})
  @Max(Validation.MAX_NUMBER_OF_YEARS, {message: 'ERRORS.VALID_BETWEEN_NUMBERS_0_80'})
  @IsDefined({message: 'ERRORS.VALID_INTEGER'})
  @IsInt({message: 'ERRORS.VALID_INTEGER'})
    years: number;

  @Min(Validation.MIN_VALUE, {message: 'ERRORS.VALID_BETWEEN_NUMBERS_0_11'})
  @Max(Validation.MAX_NUMBER_OF_MONTHS, {message: 'ERRORS.VALID_BETWEEN_NUMBERS_0_11'})
  @IsDefined({message: 'ERRORS.VALID_INTEGER'})
  @IsInt({message: 'ERRORS.VALID_INTEGER'})
    months: number;

  constructor(years?: string, months?: string) {
    this.years = Number.parseInt(years);
    this.months = Number.parseInt(months);
  }
}
