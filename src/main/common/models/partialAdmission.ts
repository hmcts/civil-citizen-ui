import { WhyDoYouDisagree } from '../form/models/admission/partialAdmission/whyDoYouDisagree';
import { HowMuchDoYouOwe } from '../form/models/admission/partialAdmission/howMuchDoYouOwe';
import {AlreadyPaid} from '../form/models/admission/partialAdmission/alreadyPaid';

export class PartialAdmission {
  whyDoYouDisagree?: WhyDoYouDisagree;
  howMuchDoYouOwe?: HowMuchDoYouOwe;
  alreadyPaid?: AlreadyPaid;
}

