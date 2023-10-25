import {DateTime} from 'luxon';
import {YesNoUpperCamelCase} from 'form/models/yesNo';
import {InterestClaimOptionsType} from 'form/models/claim/interest/interestClaimOptionsType';
import {CCDClaim} from 'models/civilClaimResponse';
import {Claim} from 'models/claim';
import {toCCDClaimAmount} from '../response/convertToCCDClaimAmount';
import {toCCDEvidence} from '../response/convertToCCDEvidence';
import {toCCDInterestType} from '../response/convertToCCDInterestType';
import {toCCDParty} from '../response/convertToCCDParty';
import {toCCDSameRateInterestSelection} from '../response/convertToCCDtoSameRateInterestSelection';
import {toCCDYesNo} from '../response/convertToCCDYesNo';
import {AppRequest} from 'models/AppRequest';
import {getClaimantIdamDetails} from 'services/translation/response/claimantIdamDetails';
import {toCCDRejectAllOfClaimType} from 'services/translation/response/convertToCCDRejectAllOfClaimType';
import {toCCDRespondToClaim} from 'services/translation/response/convertToCCDRespondToClaim';
import {
  toAdditionalPartyDetails,
} from 'models/ccdResponse/ccdAdditionalPartyDetails';
import {toCCDRespondentLiPResponse} from '../response/convertToCCDRespondentLiPResponse';
import {toCCDClaimFee} from 'models/ccdResponse/ccdClaimFee';
import {toCCDTimelineEvent} from 'models/ccdResponse/ccdTimeLine';
import {toCCDHelpWithFees} from 'services/translation/response/convertToCCDHelpWithFees';

export const translateDraftClaimToCCD = (claim: Claim, req: AppRequest): CCDClaim => {
  return {
    applicant1: toCCDParty(claim.applicant1),
    respondent1: toCCDParty(claim.respondent1),
    defenceRouteRequired: toCCDRejectAllOfClaimType(claim.rejectAllOfClaim?.option),
    respondToClaim: toCCDRespondToClaim(claim.rejectAllOfClaim?.howMuchHaveYouPaid),
    detailsOfWhyDoesYouDisputeTheClaim: claim.rejectAllOfClaim?.defence?.text ?? claim.rejectAllOfClaim?.whyDoYouDisagree?.text,
    applicant1Represented: YesNoUpperCamelCase.NO,
    totalClaimAmount: claim.totalClaimAmount,
    claimAmountBreakup: toCCDClaimAmount(claim.claimAmountBreakup),
    detailsOfClaim: claim.claimDetails?.reason?.text,
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
    claimantUserDetails: getClaimantIdamDetails(req.session?.user),
    respondent1LiPResponse: toCCDRespondentLiPResponse(claim),
    specRespondent1Represented: YesNoUpperCamelCase.NO,
    respondent1ResponseDeadline: claim.respondent1ResponseDeadline,
    helpWithFees: toCCDHelpWithFees(claim?.claimDetails?.helpWithFees),
    pcqId: claim.pcqId,
    respondent1AdditionalLipPartyDetails: toAdditionalPartyDetails(claim.respondent1),
    applicant1AdditionalLipPartyDetails: toAdditionalPartyDetails(claim.applicant1),
  };
};
export const translateDraftClaimToCCDR2 = (claim: Claim, req: AppRequest): CCDClaim => {
  const ccdClaim = translateDraftClaimToCCD(claim, req);
  ccdClaim.timelineOfEvents = toCCDTimelineEvent(claim.claimDetails?.timeline);
  ccdClaim.claimFee = toCCDClaimFee(claim.claimFee);
  return ccdClaim;
};
