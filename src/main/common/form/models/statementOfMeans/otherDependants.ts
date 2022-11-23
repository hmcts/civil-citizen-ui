import {IsDefined, IsNotEmpty, ValidateIf, Validate} from 'class-validator';
import {NumberOfPeopleValidator} from 'form/validators/numberOfPeopleValidator';

export class OtherDependants {
  @IsDefined({message: 'ERRORS.VALID_YES_NO_OPTION'})
    option?: string;

  @ValidateIf(o => (o.option === 'yes'))
  @Validate(NumberOfPeopleValidator)
    numberOfPeople?: number;

  @ValidateIf(o => o.option === 'yes')
  @IsNotEmpty({ message: 'ERRORS.DETAILS_REQUIRED' })
    details?: string;

  constructor(option?: string, numberOfPeople?: number, details?:string) {
    this.option = option;
    this.numberOfPeople = Math.floor(numberOfPeople);
    this.details = details;
  }
}
