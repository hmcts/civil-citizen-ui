import {WhyDoYouDisagree} from '../form/models/admission/partialAdmission/whyDoYouDisagree';
import {HowMuchDoYouOwe} from '../form/models/admission/partialAdmission/howMuchDoYouOwe';
import {HowMuchHaveYouPaid} from '../form/models/admission/howMuchHaveYouPaid';
import {Timeline} from '../form/models/timeLineOfEvents/timeline';
import {PaymentIntention} from '../form/models/admission/partialAdmission/paymentIntention';
import {GenericYesNo} from '../form/models/genericYesNo';

export class PartialAdmission {
  whyDoYouDisagree?: WhyDoYouDisagree;
  howMuchDoYouOwe?: HowMuchDoYouOwe;
  alreadyPaid?: GenericYesNo;
  howMuchHaveYouPaid?: HowMuchHaveYouPaid;
  timeline?: Timeline;
  paymentIntention?: PaymentIntention;
}
