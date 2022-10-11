import {InterestStartDate} from './interestStartDate';

export class Interest {
  interestStartDate?: InterestStartDate;

  constructor(interestStartDate?: InterestStartDate) {
    this.interestStartDate = interestStartDate;
  }
}
