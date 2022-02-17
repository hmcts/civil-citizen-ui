import {IsDate, Min, Max, ValidationError,Validate} from 'class-validator';
import {FormValidationError} from '../validationErrors/formValidationError';
import {OptionalDateValidator} from '../validators/optionalDateValidator';
import {REAL_DATE_VALUES_NOT_ALLOWED} from '../validationErrors/errorMessageConstants';

export class CitizenDob {

  @IsDate()
  @Validate(OptionalDateValidator, {message: REAL_DATE_VALUES_NOT_ALLOWED})
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
  error?: ValidationError[]

  constructor(dateOfBirth?: Date,  year?:number,  month?:number,  day?:number, error?: ValidationError[]) {

    this.dateOfBirth = dateOfBirth;
    this.year = year;
    this.month = month;
    this.day = day;
    this.error = error;
  }
  hasError(): boolean {
    return this.error !== undefined;
  }
  getErrorMessage(): string[] {
    if(this.hasError()) {
      const validators : string[] = [];
      for (const item of this.error) {
        validators.push(new FormValidationError(item).message);
      }
      return validators;
    }
  }
}
