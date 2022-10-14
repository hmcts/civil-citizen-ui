import {InterestStartDate} from './interestStartDate';
import {TotalInterest} from './totalInterest';

export class Interest {
  interestStartDate?: InterestStartDate;
  totalInterest?: TotalInterest;

  constructor(interestStartDate?: InterestStartDate) {
    this.interestStartDate = interestStartDate;
  }
}
