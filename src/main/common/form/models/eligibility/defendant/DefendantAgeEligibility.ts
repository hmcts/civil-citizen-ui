import {IsDefined} from 'class-validator';

export class DefendantAgeEligibility {
  @IsDefined({message: 'ERRORS.DEFENDANT_AGE_REQUIRED'})
    options:AgeEligibilityOptions;

  constructor(options: AgeEligibilityOptions) {
    this.options = options;
  }
}
