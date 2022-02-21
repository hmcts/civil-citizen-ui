import {IsDate, Min, Max,MaxDate, ValidationError} from 'class-validator';
import {NON_FUTURE_VALUES_NOT_ALLOWED} from '../validationErrors/errorMessageConstants';
import {Form} from './form';

export class CitizenDob extends Form{

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

  constructor(year?:string,  month?:string,  day?:string, errors?: ValidationError[]) {
    super(errors);
    this.dateOfBirth = this.ValidDate(year,month,day);
    this.year = Number(year);
    this.month = Number(month);
    this.day = Number(day);
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
