import {InterestStartDate} from './interestStartDate';
import {TotalInterest} from './totalInterest';
import {YesNo} from '../../../../common/form/models/yesNo';

export class Interest {
  interestStartDate?: InterestStartDate;
  totalInterest?: TotalInterest;
  continueClaimingInterest?: YesNo;

  constructor(interestStartDate?: InterestStartDate) {
    this.interestStartDate = interestStartDate;
  }
}
