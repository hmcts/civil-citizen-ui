import {IsDefined, IsIn} from 'class-validator';
import {OPTION_REQUIRED_RESPONSE} from '../validationErrors/errorMessageConstants';
import {HowMuchHaveYouPaid} from './admission/howMuchHaveYouPaid';
import {WhyDoYouDisagree} from './admission/partialAdmission/whyDoYouDisagree';
import RejectAllOfClaimType from '../../form/models/rejectAllOfClaimType';
import {Defence} from '../../form/models/defence';

export class RejectAllOfClaim {
  @IsDefined({message: OPTION_REQUIRED_RESPONSE})
  @IsIn(Object.values(RejectAllOfClaimType), {message: OPTION_REQUIRED_RESPONSE})
    option: string;

  howMuchHaveYouPaid?: HowMuchHaveYouPaid;
  whyDoYouDisagree?: WhyDoYouDisagree;
  defence?: Defence;

  constructor(option?: string, howMuchHaveYouPaid?: HowMuchHaveYouPaid, whyDoYouDisagree?: WhyDoYouDisagree, defence?: Defence) {
    this.option = option;
    this.howMuchHaveYouPaid = howMuchHaveYouPaid;
    this.whyDoYouDisagree = whyDoYouDisagree;
    this.defence = defence;
  }
}
