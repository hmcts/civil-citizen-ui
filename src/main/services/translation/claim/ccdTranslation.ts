import {DateTime} from 'luxon';
import {YesNoUpperCamelCase} from '../../../common/form/models/yesNo';
import {InterestClaimOptionsType} from '../../../common/form/models/claim/interest/interestClaimOptionsType';
import {CCDClaim} from '../../../common/models/civilClaimResponse';
import {Claim} from '../../../common/models/claim';
import {toCCDClaimAmount} from '../response/convertToCCDClaimAmount';
import {toCCDEvidence} from '../response/convertToCCDEvidence';
import {toCCDInterestType} from '../response/convertToCCDInterestType';
import {toCCDParty} from '../response/convertToCCDParty';
// import {toCCDTimeline} from '../response/convertToCCDTimeLine';
import {toCCDSameRateInterestSelection} from '../response/convertToCCDtoSameRateInterestSelection';
import {toCCDYesNo} from '../response/convertToCCDYesNo';

export const translateDraftClaimToCCD = (claim: Claim): CCDClaim => {
  return {
    applicant1: toCCDParty(claim.applicant1),
    respondent1: toCCDParty(claim.respondent1),
    applicant1Represented: YesNoUpperCamelCase.NO,
    totalClaimAmount: claim.totalClaimAmount,
    claimAmountBreakup: toCCDClaimAmount(claim.claimAmountBreakup),
    detailsOfClaim: claim.claimDetails?.reason?.text,
    // specResponseTimelineOfEvents: toCCDTimeline(claim.claimDetails?.timeline),
    speclistYourEvidenceList: toCCDEvidence(claim.claimDetails?.evidence),
    claimInterest: toCCDYesNo(claim.claimInterest),
    interestClaimOptions: toCCDInterestType(claim.interest?.interestClaimOptions),
    breakDownInterestTotal: claim.interest?.interestClaimOptions === InterestClaimOptionsType.BREAK_DOWN_INTEREST ? claim.interest?.totalInterest?.amount : undefined,
    breakDownInterestDescription: claim.interest?.interestClaimOptions === InterestClaimOptionsType.BREAK_DOWN_INTEREST ? claim.interest?.totalInterest?.reason : undefined,
    sameRateInterestSelection: toCCDSameRateInterestSelection(claim.interest?.sameRateInterestSelection),
    interestClaimFrom: claim.interest?.interestClaimFrom,
    interestFromSpecificDate: claim.isInterestFromASpecificDate() ? DateTime.fromJSDate(new Date(claim.interest?.interestStartDate?.date)).toFormat('yyyy-MM-dd') : undefined,
    interestFromSpecificDateDescription: claim.isInterestFromASpecificDate() ? claim.interest?.interestStartDate?.reason : undefined,
    interestClaimUntil: claim.interest?.interestEndDate,
  };
};
