import {WhyDoYouDisagree} from '../form/models/admission/partialAdmission/whyDoYouDisagree';
import {HowMuchDoYouOwe} from '../form/models/admission/partialAdmission/howMuchDoYouOwe';
import {HowMuchHaveYouPaid} from '../form/models/admission/howMuchHaveYouPaid';
import {DefendantTimeline} from '../form/models/timeLineOfEvents/defendantTimeline';
import {PaymentIntention} from '../form/models/admission/partialAdmission/paymentIntention';
import {GenericYesNo} from '../form/models/genericYesNo';

export class PartialAdmission {
  whyDoYouDisagree?: WhyDoYouDisagree;
  howMuchDoYouOwe?: HowMuchDoYouOwe;
  alreadyPaid?: GenericYesNo;
  howMuchHaveYouPaid?: HowMuchHaveYouPaid;
  timeline?: DefendantTimeline;
  paymentIntention?: PaymentIntention;
}
