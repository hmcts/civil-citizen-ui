import {IsDefined, ValidateIf, ValidateNested} from 'class-validator';
import {UnemploymentCategory} from './unemploymentCategory';
import {UnemploymentDetails} from './unemploymentDetails';
import {OtherDetails} from './otherDetails';

export class Unemployment {
  @IsDefined({message: 'ERRORS.SELECT_AN_OPTION'})
    option: UnemploymentCategory;

  @ValidateIf(o => o.option === UnemploymentCategory.UNEMPLOYED)
  @IsDefined({message: 'ERRORS.SELECT_AN_OPTION'})
  @ValidateNested()
    unemploymentDetails: UnemploymentDetails;

  @ValidateIf(o => o.option === UnemploymentCategory.OTHER)
  @IsDefined({message: 'ERRORS.SELECT_AN_OPTION'})
  @ValidateNested()
    otherDetails: OtherDetails;

  constructor(option?: UnemploymentCategory, unemploymentDetails?: UnemploymentDetails, otherDetails?: OtherDetails) {
    this.option = option;
    this.unemploymentDetails = unemploymentDetails;
    this.otherDetails = otherDetails;
  }
}
