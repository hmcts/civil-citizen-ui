import {InterestStartDate} from './interestStartDate';
import {YesNo} from '../../../../common/form/models/yesNo';

export class Interest {
  interestStartDate?: InterestStartDate;
  continueClaimingInterest?: YesNo;

  constructor(interestStartDate?: InterestStartDate) {
    this.interestStartDate = interestStartDate;
  }
}
