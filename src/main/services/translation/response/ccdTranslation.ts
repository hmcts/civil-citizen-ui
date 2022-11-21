import {Claim} from '../../../common/models/claim';
import {CCDResponse} from '../../../common/models/ccdResponse/ccdResponse';
import {InterestClaimOptionsType} from '../../../common/form/models/claim/interest/interestClaimOptionsType';
import {YesNoUpperCamelCase} from '../../../common/form/models/yesNo';
import {toAgreedMediation} from './convertToCCDAgreedMediation';
import {toCCDParty} from './convertToCCDParty';
import {toCCDRepaymentPlan} from './convertToCCDRepaymentPlan';
import {toCCDPaymentOption} from './convertToCCDPaymentOption';
import {toCCDPayBySetDate} from './convertToCCDPayBySetDate';
import {toCCDTimeline} from './convertToCCDTimeLine';
import {toCCDEvidence} from './convertToCCDEvidence';
import {toCCDClaimAmount} from './convertToCCDClaimAmount';
import {toCCDInterestType} from './convertToCCDInterestType';
import {toCCDSameRateInterestSelection} from './convertToCCDtoSameRateInterestSelection';
import {toCCDYesNo} from './convertToCCDYesNo';

export const translateDraftResponseToCCD = (claim: Claim, addressHasChange: boolean): CCDResponse => {
  return {
    respondent1ClaimResponseTypeForSpec: claim.respondent1?.responseType,
    defenceAdmitPartPaymentTimeRouteRequired: toCCDPaymentOption(claim.paymentOption),
    respondent1RepaymentPlan: toCCDRepaymentPlan(claim.repaymentPlan),
    respondToClaimAdmitPartLRspec: toCCDPayBySetDate(claim.paymentDate),
    responseClaimMediationSpecRequired: toAgreedMediation(claim.mediation),
    specAoSApplicantCorrespondenceAddressRequired: addressHasChange ? YesNoUpperCamelCase.NO : YesNoUpperCamelCase.YES,
    totalClaimAmount: claim.totalClaimAmount,
    respondent1: toCCDParty(claim.respondent1),

    // /claim/timeline
    specResponseTimelineOfEvents: toCCDTimeline(claim.partialAdmission.timeline),
    // x: claim.partialAdmission.timeline.comment // not used in CCD???

    // /claim/reason
    detailsOfClaim: claim.claimDetails.reason.text,

    // /claim/evidence
    speclistYourEvidenceList: toCCDEvidence(claim.evidence),
    // x: claim.evidence.comment // not used in CCD???

    // /claim/amount
    claimAmountBreakup: toCCDClaimAmount(claim.claimAmountBreakup),

    // /claim/interest
    claimInterest: toCCDYesNo(claim.claimInterest), 
    
    // /claim/interest-type
    interestClaimOptions: toCCDInterestType(claim.interest.interestClaimOptions),

    // /claim/interest-total
    breakDownInterestTotal: claim.interest.interestClaimOptions === InterestClaimOptionsType.BREAK_DOWN_INTEREST ? claim.interest.totalInterest.amount : undefined,
    breakDownInterestDescription: claim.interest.interestClaimOptions === InterestClaimOptionsType.BREAK_DOWN_INTEREST ? claim.interest.totalInterest.reason : undefined,

    // /claim/interest-rate
    sameRateInterestSelection: toCCDSameRateInterestSelection(claim.interest.sameRateInterestSelection),

    // /claim/interest-date
    interestClaimFrom: claim.interest.interestClaimFrom,

    // /claim/interest-start-date
    interestFromSpecificDate: claim.interest.interestStartDate.date.toLocaleDateString(),	//string($date)
    interestFromSpecificDateDescription: claim.interest.interestStartDate.reason, //	string

    // /claim/interest-end-date
    interestClaimUntil: claim.interest.interestEndDate,

    // /claim/interest-continue-claiming
    // x: claim.interest.continueClaimingInterest, // TODO: yes no

    // /claim/interest-how-much
    // x: claim.interest.howMuchContinueClaiming.option, //ENUM SameRateInterestType
    // x: claim.interest.howMuchContinueClaiming.dailyInterestAmount, // number

    // /claim/help-with-fees
    // x: claim.claimDetails.helpWithFees.option, // YesNo
    // x: claim.claimDetails.helpWithFees.referenceNumber, // string

  };
};
