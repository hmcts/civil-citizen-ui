import {Claim} from 'models/claim';
import {CCDResponse} from 'models/ccdResponse/ccdResponse';
import {YesNoUpperCamelCase} from 'form/models/yesNo';
import {toAgreedMediation} from './convertToCCDAgreedMediation';
import {toCCDParty} from './convertToCCDParty';
import {toCCDRepaymentPlan} from './convertToCCDRepaymentPlan';
import {toCCDPaymentOption} from './convertToCCDPaymentOption';
import {toCCDPayBySetDate} from './convertToCCDPayBySetDate';
import {toCCDWelshLanguageRequirements} from 'services/translation/response/convertToCCDWelshLanguageRequirements';
import {toCCDVulnerability} from 'services/translation/response/convertToCCDVulenrabilityQuestions';
import {toCCDSpecificCourtLocations} from 'services/translation/response/convertToCCDSpecificCourtLocations';
import {toCCDSHearingSupport} from 'services/translation/response/convertToCCDHearingSupport';
import {toCCDWitnesses} from 'services/translation/response/convertToCCDWitnesses';
import {toCCDSmallClaimHearing} from 'services/translation/response/convertToCCDSmallClaimHearing';
import {toCCDDQExtraDetails} from 'services/translation/response/convertToCCDDQExtraDetials';
import {toCCDFastClaimHearing} from 'services/translation/response/convertToCCDFastClaimHearing';

export const translateDraftResponseToCCD = (claim: Claim, addressHasChange: boolean): CCDResponse => {
  return {
    respondent1ClaimResponseTypeForSpec: claim.respondent1?.responseType,
    defenceAdmitPartPaymentTimeRouteRequired: toCCDPaymentOption(claim),
    respondent1RepaymentPlan: toCCDRepaymentPlan(claim.partialAdmission?.paymentIntention?.repaymentPlan),
    respondToClaimAdmitPartLRspec: toCCDPayBySetDate(claim.partialAdmission.paymentIntention.paymentDate),
    responseClaimMediationSpecRequired: toAgreedMediation(claim.mediation),
    specAoSApplicantCorrespondenceAddressRequired: addressHasChange ? YesNoUpperCamelCase.NO : YesNoUpperCamelCase.YES,
    totalClaimAmount: claim.totalClaimAmount,
    respondent1: toCCDParty(claim.respondent1),
    respondent1DQLanguage: toCCDWelshLanguageRequirements(claim.directionQuestionnaire?.welshLanguageRequirements),
    respondent1DQVulnerabilityQuestions: toCCDVulnerability(claim.directionQuestionnaire?.vulnerabilityQuestions),
    respondent1DQRequestedCourt: toCCDSpecificCourtLocations(claim.directionQuestionnaire?.hearing?.specificCourtLocation),
    respondent1DQHearingSupport: toCCDSHearingSupport(claim.directionQuestionnaire?.hearing?.supportRequiredList),
    respondent1DQWitnesses: toCCDWitnesses(claim.directionQuestionnaire?.witnesses),
    respondent1DQHearingSmallClaim: claim.isSmallClaimsTrackDQ ? toCCDSmallClaimHearing(claim.directionQuestionnaire?.hearing) : undefined,
    respondent1DQHearingFastClaim: claim.isFastTrackClaim ? toCCDFastClaimHearing(claim.directionQuestionnaire?.hearing) : undefined,
    respondent1DQExtraDetails: toCCDDQExtraDetails(claim.directionQuestionnaire),
  };
};

