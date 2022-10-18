import {InterestStartDate} from './interestStartDate';
import {TotalInterest} from './totalInterest';
import {YesNo} from '../../../../common/form/models/yesNo';

export class Interest {
  continueClaimingInterest?: YesNo;
  interestStartDate?: InterestStartDate;
  totalInterest?: TotalInterest;

  constructor(interestStartDate?: InterestStartDate) {
    this.interestStartDate = interestStartDate;
  }
}
