import {InterestStartDate} from './interestStartDate';
import {InterestEndDateType} from '../../../../common/form/models/claimDetails';

export class Interest {
  interestStartDate?: InterestStartDate;
  interestEndDate?: InterestEndDateType;

  constructor(
    interestStartDate?: InterestStartDate,
    interestEndDate?: InterestEndDateType
  ) {
    this.interestStartDate = interestStartDate;
    this.interestEndDate = interestEndDate;
  }
}
