import {Claim} from '../../../common/models/claim';
import {CCDResponse} from '../../../common/models/ccdResponse/ccdResponse';
import {toAgreedMediation} from './convertToCCDAgreedMediation';
import {YesNoUpperCamelCase} from '../../../common/form/models/yesNo';
import {toCCDParty} from './convertToCCDParty';
import {toCCDRepaymentPlan} from './convertToCCDRepaymentPlan';
import {toCCDPaymentOption} from './convertToCCDPaymentOption';
import {toCCDPayBySetDate} from './convertToCCDPayBySetDate';
import {toCCDTimeline} from './convertToCCDTimeLine';
import {toCCDEvidence} from './convertToCCDEvidence';
import {toCCDClaimAmount} from './convertToCCDClaimAmount';
import {toCCDInterestType} from './convertToCCDInterestType';
import { InterestClaimOptionsType } from 'common/form/models/claim/interest/interestClaimOptionsType';
import { toCCDSameRateInterestSelection } from './convertToCCDtoSameRateInterestSelection';
// import { toCCDDifferentRate } from './convertToDifferentRate';

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

    // Claim Amount
    // /claim/amount
    claimAmountBreakup: toCCDClaimAmount(claim.claimAmountBreakup),

    // /claim/interest
    claimInterest: claim.claimInterest, // TODO convert yes to Yes or YES"claimInterest": "YES",
    
    // /claim/interest-type
    interestClaimOptions: toCCDInterestType(claim.interest.interestClaimOptions),

    // /claim/interest-total.
    breakDownInterestTotal: claim.interest.interestClaimOptions === InterestClaimOptionsType.BREAK_DOWN_INTEREST ? claim.interest.totalInterest.amount : undefined,
    breakDownInterestDescription: claim.interest.interestClaimOptions === InterestClaimOptionsType.BREAK_DOWN_INTEREST ? claim.interest.totalInterest.reason : undefined,

    // /claim/interest-rate
    sameRateInterestSelection: toCCDSameRateInterestSelection(claim.interest.sameRateInterestSelection),

    // /claim/interest-date
    // /claim/interest-start-date
    // /claim/interest-end-date
    // /claim/interest-continue-claiming
    // /claim/interest-how-much
    // /claim/help-with-fees

    // CCD
    // "claimInterest": "YES",
    // "totalInterest": 0,
    // "interestClaimFrom": "FROM_CLAIM_SUBMIT_DATE",
    // "interestClaimOptions": "SAME_RATE_INTEREST",
    // "interestClaimUntil": "UNTIL_CLAIM_SUBMIT_DATE",
    // "interestFromSpecificDate": "string",
    // "interestFromSpecificDateDescription": "string",
    // "sameRateInterestSelection": {
    //   "differentRate": 0,
    //   "differentRateReason": "string",
    //   "sameRateInterestType": "SAME_RATE_INTEREST_8_PC"
    // },

  };
};
