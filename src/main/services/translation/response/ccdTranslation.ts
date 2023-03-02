import {Claim} from 'models/claim';
import {CCDResponse} from 'models/ccdResponse/ccdResponse';
import {toUpperYesOrNo, YesNoUpperCamelCase} from 'form/models/yesNo';
import {toAgreedMediation} from './convertToCCDAgreedMediation';
import {toCCDParty} from './convertToCCDParty';
import {toCCDRepaymentPlan} from './convertToCCDRepaymentPlan';
import {toCCDPaymentOption} from './convertToCCDPaymentOption';
import {toCCDPayBySetDate} from './convertToCCDPayBySetDate';
import {toCCDRespondentLiPResponse} from 'services/translation/response/convertToCCDRespondentLiPResponse';
import {toCCDAdmitPartRoute} from 'services/translation/response/convertToCCDAdmitPartRoute';
import {TimelineUploadTypeSpec} from 'models/ccdResponse/ccdHowToAddTimeline';
import {toCCDResponseTimelineOfEvents} from 'services/translation/response/convertToCCDResponseTimelineOfEvents';
import {toCCDEvidence} from 'services/translation/response/convertToCCDEvidence';

export const translateDraftResponseToCCD = (claim: Claim, addressHasChange: boolean): CCDResponse => {
  return {
    respondent1ClaimResponseTypeForSpec: claim.respondent1?.responseType,
    defenceAdmitPartPaymentTimeRouteRequired: toCCDPaymentOption(claim),
    respondent1RepaymentPlan: toCCDRepaymentPlan(claim.partialAdmission?.paymentIntention?.repaymentPlan),
    respondToClaimAdmitPartLRspec: toCCDPayBySetDate(claim.partialAdmission?.paymentIntention?.paymentDate),
    responseClaimMediationSpecRequired: toAgreedMediation(claim.mediation),
    specAoSApplicantCorrespondenceAddressRequired: addressHasChange ? YesNoUpperCamelCase.NO : YesNoUpperCamelCase.YES,
    totalClaimAmount: claim.totalClaimAmount,
    respondent1: toCCDParty(claim.respondent1),
    respondent1LiPResponse: toCCDRespondentLiPResponse(claim),
    respondToAdmittedClaim: toCCDAdmitPartRoute(claim.partialAdmission),
    specDefenceAdmittedRequired: toUpperYesOrNo(claim.partialAdmission?.alreadyPaid),
    respondToAdmittedClaimOwingAmount: claim.partialAdmission.howMuchDoYouOwe?.amount?.toString(),
    detailsOfWhyDoesYouDisputeTheClaim: claim.partialAdmission?.whyDoYouDisagree?.text,
    specClaimResponseTimelineList: TimelineUploadTypeSpec.MANUAL, // sets to manual cause CUI do not have other option
    specResponseTimelineOfEvents: toCCDResponseTimelineOfEvents(claim.partialAdmission?.timeline),
    specResponselistYourEvidenceList: toCCDEvidence(claim.evidence),
  };
};

