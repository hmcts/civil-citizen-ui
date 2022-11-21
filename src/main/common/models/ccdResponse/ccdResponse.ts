import {CCDPaymentOption} from './ccdPaymentOption';
import {ClaimUpdate} from '../../models/events/eventDto';
import {CCDRepaymentPlan} from './ccdRepaymentPlan';
import {CCDPayBySetDate} from './ccdPayBySetDate';
import {YesNoUpperCamelCase} from '../../../common/form/models/yesNo';
import {CCDParty} from './ccdParty';
import {CCDTimeLineOfEvents} from './ccdTimeLineOfEvents';
import {CCDEvidence} from './ccdEvidence';
import {CCDClaimAmountBreakup} from './ccdClaimAmountBreakup';
import {CCDInterestType} from './ccdInterestType';
import {CCDSameRateInterestSelection} from './ccdSameRateInterestSelection';
import {InterestClaimFromType, InterestEndDateType} from '../../../common/form/models/claimDetails';

export interface CCDResponse extends ClaimUpdate {
  respondent1ClaimResponseTypeForSpec: string;
  defenceAdmitPartPaymentTimeRouteRequired?: CCDPaymentOption;
  respondent1RepaymentPlan?: CCDRepaymentPlan;
  respondToClaimAdmitPartLRspec?: CCDPayBySetDate;
  responseClaimMediationSpecRequired?: string;
  specAoSApplicantCorrespondenceAddressRequired?: YesNoUpperCamelCase;
  totalClaimAmount: number,
  respondent1: CCDParty;
  specResponseTimelineOfEvents: CCDTimeLineOfEvents[],
  detailsOfClaim: string,
  speclistYourEvidenceList: CCDEvidence[],
  claimAmountBreakup: CCDClaimAmountBreakup[],
  claimInterest: string, // Yes No
  interestClaimOptions: CCDInterestType,
  breakDownInterestTotal: number,
  breakDownInterestDescription: string,
  sameRateInterestSelection: CCDSameRateInterestSelection,
  interestClaimFrom: InterestClaimFromType,
  interestFromSpecificDate: string,
  interestFromSpecificDateDescription: string,
  interestClaimUntil: InterestEndDateType,
}
