import {IsDefined, IsIn} from 'class-validator';
import {HowMuchHaveYouPaid} from './admission/howMuchHaveYouPaid';
import {WhyDoYouDisagree} from './admission/partialAdmission/whyDoYouDisagree';
import {Defence} from 'form/models/defence';
import {RejectAllOfClaimType} from 'form/models/rejectAllOfClaimType';

export class RejectAllOfClaim {
  @IsDefined({message: 'ERRORS.OPTION_REQUIRED_RESPONSE'})
  @IsIn(Object.values(RejectAllOfClaimType), {message: 'ERRORS.OPTION_REQUIRED_RESPONSE'})
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
