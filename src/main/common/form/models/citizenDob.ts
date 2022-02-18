import {IsDate, Min, Max,MaxDate, ValidationError} from 'class-validator';
import {FormValidationError} from '../validationErrors/formValidationError';
import {NON_FUTURE_VALUES_NOT_ALLOWED} from 'common/form/validationErrors/errorMessageConstants';

export class CitizenDob {

  @IsDate()
  @MaxDate(new Date(Date.now()),{message: NON_FUTURE_VALUES_NOT_ALLOWED})
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

  constructor(year?:string,  month?:string,  day?:string, error?: ValidationError[]) {

    this.dateOfBirth = this.ValidDate(year,month,day);
    this.year = Number(year);
    this.month = Number(month);
    this.day = Number(day);
    this.error = error;

  }
  hasError(): boolean {
    return this.error !== undefined;
  }

  getErrors(): FormValidationError[] {
    if(this.hasError()) {
      const validators : FormValidationError[] = [];
      for (const item of this.error) {
        validators.push(new FormValidationError(item));
      }
      return validators;
    }
  }

  private ValidDate (year:string,month:string,day:string){
    const dob = new Date(year+'-'+month+'-'+day);
    const dobDay = Number(day);
    if ((dob.getDate()==dobDay)){
      return dob;
    }
    return null;
  }
}
