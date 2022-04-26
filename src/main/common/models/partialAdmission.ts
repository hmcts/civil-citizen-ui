import { WhyDoYouDisagree } from '../form/models/admission/partialAdmission/whyDoYouDisagree';
import { HowMuchDoYouOwe } from '../form/models/admission/partialAdmission/howMuchDoYouOwe';
import {HowMuchHaveYouPaid} from '../form/models/admission/partialAdmission/howMuchHaveYouPaid';

export class PartialAdmission {
  whyDoYouDisagree?: WhyDoYouDisagree;
  howMuchDoYouOwe?: HowMuchDoYouOwe;
  howMuchHaveYouPaid?: HowMuchHaveYouPaid;
}
