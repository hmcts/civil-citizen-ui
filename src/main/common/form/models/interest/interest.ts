import {InterestStartDate} from './interestStartDate';
import {
  InterestClaimFromType,
  InterestEndDateType,
  SameRateInterestSelection,
} from '../../../../common/form/models/claimDetails';
import {TotalInterest} from './totalInterest';
import {YesNo} from '../../../../common/form/models/yesNo';
import {HowMuchContinueClaiming} from './howMuchContinueClaiming';
import {InterestClaimOptionsType} from '../../../../common/form/models/claim/interest/interestClaimOptionsType';

export class Interest {
  continueClaimingInterest?: YesNo;
  interestStartDate?: InterestStartDate;
  interestEndDate?: InterestEndDateType;
  totalInterest?: TotalInterest;
  howMuchContinueClaiming?: HowMuchContinueClaiming;
  interestClaimFrom?: InterestClaimFromType;
  interestClaimOptions?: InterestClaimOptionsType;
  sameRateInterestSelection?: SameRateInterestSelection;
  breakDownInterestTotal?: number;
}