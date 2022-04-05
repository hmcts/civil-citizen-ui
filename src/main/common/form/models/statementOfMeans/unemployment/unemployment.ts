import {Form} from '../../form';
import {IsDefined, ValidateIf, ValidateNested, ValidationError} from 'class-validator';
import {SELECT_AN_OPTION} from '../../../validationErrors/errorMessageConstants';
import {UnemploymentCategory} from './unemploymentCategory';
import {UnemploymentDetails} from './unemploymentDetails';
import {OtherDetails} from './otherDetails';

export class Unemployment extends Form {

  @IsDefined({message: SELECT_AN_OPTION})
    option: UnemploymentCategory;

  @ValidateIf(o => o.option === UnemploymentCategory.UNEMPLOYED)
  @IsDefined({message: SELECT_AN_OPTION})
  @ValidateNested()
    unemploymentDetails: UnemploymentDetails;

  @ValidateIf(o => o.option === UnemploymentCategory.OTHER)
  @IsDefined({message: SELECT_AN_OPTION})
  @ValidateNested()
    otherDetails: OtherDetails;

  constructor(option?: UnemploymentCategory, unemploymentDetails?: UnemploymentDetails, otherDetails?: OtherDetails, errors?: ValidationError[]) {
    super(errors);
    this.option = option;
    this.unemploymentDetails = unemploymentDetails;
    this.otherDetails = otherDetails;
  }

  hasEmploymentCategory(value: UnemploymentCategory) {
    return this.option && this.option.includes(value);
  }

  isUnemployed() {
    return this.option.length == 1 && this.option[0] === UnemploymentCategory.UNEMPLOYED;
  }

  isOther() {
    return this.option.length == 1 && this.option[0] === UnemploymentCategory.OTHER;
  }
}
