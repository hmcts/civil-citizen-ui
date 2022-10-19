import {InterestStartDate} from './interestStartDate';
import {TotalInterest} from './totalInterest';
import {YesNo} from '../../../../common/form/models/yesNo';
import {HowMuchContinueClaiming} from './howMuchContinueClaiming';

export class Interest {
  continueClaimingInterest?: YesNo;
  interestStartDate?: InterestStartDate;
  totalInterest?: TotalInterest;
  howMuchContinueClaiming?: HowMuchContinueClaiming;

  constructor(interestStartDate?: InterestStartDate) {
    this.interestStartDate = interestStartDate;
  }
}
