import {InterestStartDate} from './interestStartDate';
import {InterestEndDateType} from '../../../../common/form/models/claimDetails';
import {TotalInterest} from './totalInterest';
import {YesNo} from '../../../../common/form/models/yesNo';
import {HowMuchContinueClaiming} from './howMuchContinueClaiming';

export class Interest {
  continueClaimingInterest?: YesNo;
  interestStartDate?: InterestStartDate;
  interestEndDate?: InterestEndDateType;
  totalInterest?: TotalInterest;
  howMuchContinueClaiming?: HowMuchContinueClaiming;

  constructor(
    interestStartDate?: InterestStartDate,
    interestEndDate?: InterestEndDateType,
  ) {
    this.interestStartDate = interestStartDate;
    this.interestEndDate = interestEndDate;
  }
}
