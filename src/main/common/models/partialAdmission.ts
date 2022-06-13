import {WhyDoYouDisagree} from '../form/models/admission/partialAdmission/whyDoYouDisagree';
import {HowMuchDoYouOwe} from '../form/models/admission/partialAdmission/howMuchDoYouOwe';
import {AlreadyPaid} from '../form/models/admission/partialAdmission/alreadyPaid';
import {HowMuchHaveYouPaid} from '../form/models/admission/partialAdmission/howMuchHaveYouPaid';
import {DefendantTimeline} from '../form/models/timeLineOfEvents/defendantTimeline';
import {PaymentIntention} from '../form/models/admission/paymentIntention';

export class PartialAdmission {
  whyDoYouDisagree?: WhyDoYouDisagree;
  howMuchDoYouOwe?: HowMuchDoYouOwe;
  alreadyPaid?: AlreadyPaid;
  howMuchHaveYouPaid?: HowMuchHaveYouPaid;
  timeline?: DefendantTimeline;
  paymentIntention?: PaymentIntention;
}


