import {Claim} from 'models/claim';
import {YesNoUpperCamelCase} from 'form/models/yesNo';
import {toAgreedMediation} from './convertToCCDAgreedMediation';
import {toCCDParty} from './convertToCCDParty';
import {toCCDRepaymentPlan} from './convertToCCDRepaymentPlan';
import {toCCDPaymentOption} from './convertToCCDPaymentOption';
import {toCCDPayBySetDate} from './convertToCCDPayBySetDate';
import {toCCDResponseType} from 'services/translation/response/convertToCCDResponseType';
import {toCCDAdmitPartRoute} from 'services/translation/response/convertToCCDAdmitPartRoute';
import {toCCDResponseTimelineOfEvents} from 'services/translation/response/convertToCCDResponseTimelineOfEvents';
import {TimelineUploadTypeSpec} from 'models/ccdResponse/ccdHowToAddTimeline';
// import {toCCDTimeRouteRequired} from 'services/translation/response/convertToCCDTimeRouteRequired';
import {CCDResponse} from 'models/ccdResponse/ccdResponse';
// import {toCCDExpertRequired} from 'services/translation/response/convertToCCDExpertRequired';
// import {toCCDRespondentDQ} from 'services/translation/response/convertToCCDRespondentDQ';
import {
  toCCDRespondentLiPResponse
} from 'services/translation/response/convertToCCDRespondentLiPResponse';
import {toCCDYesNoFromGenericYesNo} from "services/translation/response/convertToCCDYesNo";

export const translateDraftResponseToCCD = (claim: Claim, addressHasChange: boolean): CCDResponse => {

  return {
    defenceAdmitPartPaymentTimeRouteRequired: toCCDPaymentOption(claim.partialAdmission?.paymentIntention?.paymentOption),
    respondent1RepaymentPlan: toCCDRepaymentPlan(claim.partialAdmission?.paymentIntention?.repaymentPlan),
    respondToClaimAdmitPartLRspec: toCCDPayBySetDate(claim.partialAdmission?.paymentIntention?.paymentDate),
    responseClaimMediationSpecRequired: toAgreedMediation(claim.mediation),
    specAoSApplicantCorrespondenceAddressRequired: addressHasChange ? YesNoUpperCamelCase.NO : YesNoUpperCamelCase.YES,
    totalClaimAmount: claim.totalClaimAmount,
    respondent1: toCCDParty(claim.respondent1),
    respondent1ClaimResponseTypeForSpec: toCCDResponseType(claim.respondent1?.responseType),
    respondToAdmittedClaim: toCCDAdmitPartRoute(claim.partialAdmission),
    specDefenceAdmittedRequired: toCCDYesNoFromGenericYesNo(claim.partialAdmission?.alreadyPaid),
    respondToAdmittedClaimOwingAmount: claim.partialAdmission.howMuchDoYouOwe?.amount?.toString(),
    detailsOfWhyDoesYouDisputeTheClaim: claim.partialAdmission?.whyDoYouDisagree?.text,
    specClaimResponseTimelineList: TimelineUploadTypeSpec.MANUAL, // sets to manual cause CUI do not have other option
    specResponseTimelineOfEvents: toCCDResponseTimelineOfEvents(claim.partialAdmission?.timeline),
    // TODO This field is for respondent 2
    // defenceAdmitPartPaymentTimeRouteRequired2: toCCDTimeRouteRequired(claim.partialAdmission?.paymentIntention?.paymentOption),
    // TODO Not related to CIV-5788
    // responseClaimExpertSpecRequired: toCCDExpertRequired(claim.directionQuestionnaire?.experts?.expertRequired),
    // respondent1DQ: toCCDRespondentDQ(claim),
    respondent1LiPResponse: toCCDRespondentLiPResponse(claim),
  };
};
