import {Claim} from 'common/models/claim';
import {toCCDWitnesses} from '../response/convertToCCDWitnesses';
import {toCCDWelshLanguageRequirements} from '../response/convertToCCDWelshLanguageRequirements';
import {toCCDVulnerability} from '../response/convertToCCDVulenrabilityQuestions';
import {toCCDSpecificCourtLocations} from '../response/convertToCCDSpecificCourtLocations';
import {toCCDSmallClaimHearing} from '../response/convertToCCDSmallClaimHearing';
import {toCCDClaimantLiPResponse} from './convertToCCDClaimantLiPResponse';
import {toCCDYesNo} from '../response/convertToCCDYesNo';
import {toCCDExpert} from '../response/convertToCCDExpert';
import {CCDClaimantResponse} from 'common/models/claimantResponse/ccdClaimantResponse';
import {toCCDClaimantMediation} from './convertToCCDClaimantMediation';
import {toCCDPaymentOption} from 'services/translation/response/convertToCCDPaymentOption';
import { toCCDClaimantPayBySetDate } from '../response/convertToCCDPayBySetDate';

export const translateClaimantResponseToCCD = (claim: Claim): CCDClaimantResponse => {
  return {
    applicant1AcceptAdmitAmountPaidSpec: toCCDYesNo(claim.claimantResponse?.hasPartAdmittedBeenAccepted?.option),
    applicant1ClaimMediationSpecRequiredLip: toCCDClaimantMediation(claim.claimantResponse?.mediation),
    applicant1LiPResponse: toCCDClaimantLiPResponse(claim.claimantResponse),
    applicant1DQLanguage: toCCDWelshLanguageRequirements(claim.claimantResponse?.directionQuestionnaire?.welshLanguageRequirements),
    applicant1DQVulnerabilityQuestions: toCCDVulnerability(claim.claimantResponse?.directionQuestionnaire?.vulnerabilityQuestions),
    applicant1DQRequestedCourt: toCCDSpecificCourtLocations(claim.claimantResponse?.directionQuestionnaire?.hearing?.specificCourtLocation),
    applicant1DQWitnesses: toCCDWitnesses(claim.claimantResponse?.directionQuestionnaire?.witnesses),
    applicant1DQSmallClaimHearing: claim.isSmallClaimsTrackDQ ? toCCDSmallClaimHearing(claim.claimantResponse?.directionQuestionnaire?.hearing) : undefined,
    applicant1DQExperts: toCCDExpert(claim),
    applicant1ClaimExpertSpecRequired: toCCDYesNo(claim.claimantResponse?.directionQuestionnaire?.experts?.permissionForExpert?.option),
    applicant1AcceptFullAdmitPaymentPlanSpec: (claim.isFullAdmission()) ? toCCDYesNo(claim.claimantResponse?.fullAdmitSetDateAcceptPayment?.option) : undefined,
    applicant1AcceptPartAdmitPaymentPlanSpec: (claim.isPartialAdmission()) ? toCCDYesNo(claim.claimantResponse?.fullAdmitSetDateAcceptPayment?.option) : undefined,
    applicant1RepaymentOptionForDefendantSpec: toCCDPaymentOption(claim.claimantResponse?.suggestedPaymentIntention?.paymentOption),
    applicant1PartAdmitConfirmAmountPaidSpec: (claim.isPartialAdmission()) ? toCCDYesNo(claim.claimantResponse?.hasDefendantPaidYou?.option) : undefined,
    applicant1PartAdmitIntentionToSettleClaimSpec: (claim.isPartialAdmission()) ? toCCDYesNo(claim.claimantResponse?.hasPartPaymentBeenAccepted?.option) : undefined,
    applicant1ProceedWithClaim : toCCDYesNo(claim.claimantResponse?.intentionToProceed?.option),
    courtDecision : claim.claimantResponse?.courtDecision,
    applicant1RequestedPaymentDateForDefendantSpec: toCCDClaimantPayBySetDate(claim.claimantResponse?.suggestedPaymentIntention?.paymentDate),
  };
};
