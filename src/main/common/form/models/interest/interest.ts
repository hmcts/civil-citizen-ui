import {InterestStartDate} from './interestStartDate';
import {HowMuchContinueClaiming} from './howMuchContinueClaiming';

export class Interest {
  interestStartDate?: InterestStartDate;
  howMuchContinueClaiming?: HowMuchContinueClaiming;

  constructor(interestStartDate?: InterestStartDate) {
    this.interestStartDate = interestStartDate;
  }
}
