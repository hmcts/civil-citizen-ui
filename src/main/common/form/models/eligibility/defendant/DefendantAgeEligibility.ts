import {IsDefined} from 'class-validator';
import {AgeEligibilityOptions} from './AgeEligibilityOptions';

export class DefendantAgeEligibility {
  @IsDefined({message: 'ERRORS.DEFENDANT_AGE_REQUIRED'})
    option?:AgeEligibilityOptions;

  constructor(option: AgeEligibilityOptions) {
    this.option = option;
  }
}
