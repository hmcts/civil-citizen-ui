import {InterestClaimOptionsType} from '../../../common/form/models/claim/interest/interestClaimOptionsType';
import {CCDClaim} from '../../../common/models/civilClaimResponse';
import {Claim} from '../../../common/models/claim';
import {toAgreedMediation} from '../response/convertToCCDAgreedMediation';
import {toCCDClaimAmount} from '../response/convertToCCDClaimAmount';
import {toCCDEvidence} from '../response/convertToCCDEvidence';
import {toCCDInterestType} from '../response/convertToCCDInterestType';
import {toCCDParty} from '../response/convertToCCDParty';
import {toCCDPayBySetDate} from '../response/convertToCCDPayBySetDate';
import {toCCDPaymentOption} from '../response/convertToCCDPaymentOption';
import {toCCDRepaymentPlan} from '../response/convertToCCDRepaymentPlan';
import {toCCDTimeline} from '../response/convertToCCDTimeLine';
import {toCCDSameRateInterestSelection} from '../response/convertToCCDtoSameRateInterestSelection';
import {toCCDYesNo} from '../response/convertToCCDYesNo';

export const translateDraftClaimToCCD = (claim: Claim): CCDClaim => {
  return {
    applicant1: toCCDParty(claim.applicant1),
    respondent1: toCCDParty(claim.respondent1),
    respondent1ClaimResponseTypeForSpec: claim.respondent1?.responseType,
    defenceAdmitPartPaymentTimeRouteRequired: toCCDPaymentOption(claim.paymentOption),
    respondent1RepaymentPlan: toCCDRepaymentPlan(claim.repaymentPlan),
    respondToClaimAdmitPartLRspec: toCCDPayBySetDate(claim.paymentDate),
    responseClaimMediationSpecRequired: toAgreedMediation(claim.mediation),
    totalClaimAmount: claim.totalClaimAmount,
    specResponseTimelineOfEvents: toCCDTimeline(claim.partialAdmission?.timeline),
    detailsOfClaim: claim.claimDetails?.reason?.text,
    speclistYourEvidenceList: toCCDEvidence(claim.evidence),
    claimAmountBreakup: toCCDClaimAmount(claim.claimAmountBreakup),
    claimInterest: toCCDYesNo(claim.claimInterest),
    interestClaimOptions: toCCDInterestType(claim.interest?.interestClaimOptions),
    breakDownInterestTotal: claim.interest?.interestClaimOptions === InterestClaimOptionsType.BREAK_DOWN_INTEREST ? claim.interest?.totalInterest?.amount : undefined,
    breakDownInterestDescription: claim.interest?.interestClaimOptions === InterestClaimOptionsType.BREAK_DOWN_INTEREST ? claim.interest?.totalInterest?.reason : undefined,
    sameRateInterestSelection: toCCDSameRateInterestSelection(claim.interest?.sameRateInterestSelection),
    interestClaimFrom: claim.interest?.interestClaimFrom,
    interestFromSpecificDate: claim.interest?.interestStartDate?.date.toLocaleDateString(),
    interestFromSpecificDateDescription: claim.interest?.interestStartDate?.reason,
    interestClaimUntil: claim.interest?.interestEndDate,
  };
};
