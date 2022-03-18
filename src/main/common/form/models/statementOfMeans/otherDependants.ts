import {IsDefined, IsNotEmpty, ValidateIf, Validate, ValidationError} from 'class-validator';
import {Form} from '../../../form/models/form';
import {
  VALID_OPTION,
  DETAILS_REQUIRED,
} from '../../../form/validationErrors/errorMessageConstants';
import {NumberOfPeopleValidator} from '../../../form/validators/numberOfPeopleValidator';

export class OtherDependantsOption extends Form {
  static readonly YES = 'yes';
  static readonly NO = 'no';
}

export class OtherDependants extends Form {
  @IsDefined({message: VALID_OPTION})
    option?: string;

  @ValidateIf(o => (o.option === 'yes'))
  @Validate(NumberOfPeopleValidator)
    numberOfPeople?: number;

  @ValidateIf(o => o.option === 'yes')
  @IsNotEmpty({ message: DETAILS_REQUIRED })
    details?: string;

  constructor(option?: string, numberOfPeople?: number, details?:string, errors?: ValidationError[]) {
    super(errors);
    this.option = option;
    this.numberOfPeople = numberOfPeople;
    this.details = details;
  }
}
