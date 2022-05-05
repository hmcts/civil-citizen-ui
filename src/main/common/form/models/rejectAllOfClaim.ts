import {IsDefined, IsIn} from 'class-validator';
import {HowMuchHaveYouPaid} from '../models/admission/partialAdmission/howMuchHaveYouPaid';
import {WhyDoYouDisagree} from '../models/admission/partialAdmission/whyDoYouDisagree';
import {OPTION_REQUIRED} from '../validationErrors/errorMessageConstants';

import RejectAllOfClaimType from '../../form/models/rejectAllOfClaimType';

export class RejectAllOfClaim {
  @IsDefined({message: OPTION_REQUIRED})
  @IsIn(Object.values(RejectAllOfClaimType), {message: OPTION_REQUIRED})
    option?: string;

  howMuchHaveYouPaid?: HowMuchHaveYouPaid;

  whyDoYouDisagree?: WhyDoYouDisagree;

  constructor(option?: string, howMuchHaveYouPaid?: HowMuchHaveYouPaid, whyDoYouDisagree?: WhyDoYouDisagree) {
    this.option = option;
    this.howMuchHaveYouPaid = howMuchHaveYouPaid;
    this.whyDoYouDisagree = whyDoYouDisagree;
  }
}
