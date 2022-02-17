import {IsDate, IsInt, Length, Min, Max, ValidationError} from 'class-validator';
import {FormValidationError} from '../validationErrors/formValidationError';

export class CitizenDob {

  @IsDate()
  dateOfBirth?: Date
  @IsInt()
  @Min(1890)
  @Max(9999)
  @Length(4, 4)
  year:number
  @IsInt()
  @Min(0)
  @Max(12)
  @Length(1, 2)
  month:number
  @IsInt()
  @Min(0)
  @Max(31)
  @Length(1, 2)
  day:number
  error?: ValidationError

  constructor(dateOfBirth?: Date,  year?:number,  month?:number,  day?:number, error?: ValidationError) {
    this.dateOfBirth = dateOfBirth;
    this.year = year;
    this.month = month;
    this.day = day;
    this.error = error;
  }
  hasError(): boolean {
    return this.error !== undefined;
  }
  getErrorMessage(): string {
    if(this.hasError()) {
      return new FormValidationError(this.error).message;
    }
  }
}
