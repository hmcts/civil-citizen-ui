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
import {toCCDRepaymentPlanFrequency} from 'services/translation/response/convertToCCDRepaymentPlan';
import {toCCDClaimantPayBySetDate} from '../response/convertToCCDPayBySetDate';
import {
  toCCDClaimantSuggestedFirstRepaymentDate,
  toCCDClaimantSuggestedPayByDate,
  toCCDClaimantPaymentOption,
  toCCDClaimantSuggestedImmediatePaymentDateInFavourClaimant,
}
  from 'services/translation/claimantResponse/convertToCCDClaimantPaymentOption';
import {toCCDDQHearingSupport} from '../response/convertToCCDHearingSupport';
import { YesNo } from 'common/form/models/yesNo';
import {toCCDMediationCarm} from 'services/translation/response/convertToCCDMediationCarm';
import {
  toCCDFixedRecoverableCostsIntermediate,
} from 'services/translation/response/convertToCCDFixedRecoverableCostsIntermediate';
import {
  toCCDDisclosureOfElectronicDocuments,
  toCCDDisclosureOfNonElectronicDocuments,
} from 'services/translation/response/convertToCCDDisclosureOfDocuments';
import {convertToCCDDocumentsToBeConsidered} from 'services/translation/response/convertToCCDDocumentsToBeConsidered';
import {
  convertToPenceFromString,
  formatAmountTwoDecimalPlaces,
} from 'services/translation/claim/moneyConversation';
import {toCCDParty} from 'services/translation/response/convertToCCDParty';
import {CCDPayBySetDate} from 'models/ccdResponse/ccdPayBySetDate';

function isClaimantWantToSettleTheClaim(claim: Claim) {
  if (claim.isPartialAdmission() || (claim.isFullDefence() && !claim.hasPaidInFull())) {
    return toCCDYesNo(claim.claimantResponse?.hasPartPaymentBeenAccepted?.option);
  } else if (claim.isFullDefence() && claim.hasPaidInFull()) {
    return toCCDYesNo(claim.claimantResponse?.hasFullDefenceStatesPaidClaimSettled?.option);
  } else {
    return undefined;
  }
}

export const translateClaimantResponseToCCD = (claim: Claim, respondToClaimAdmitPartLRspec?: CCDPayBySetDate): CCDClaimantResponse => {
  return {
    applicant1: toCCDParty(claim.applicant1),
    applicant1AcceptAdmitAmountPaidSpec: toCCDYesNo(claim.claimantResponse?.hasPartAdmittedBeenAccepted?.option),
    applicant1ClaimMediationSpecRequiredLip: toCCDClaimantMediation(claim.claimantResponse?.mediation),
    applicant1LiPResponse: toCCDClaimantLiPResponse(claim.claimantResponse),
    applicant1LiPResponseCarm: toCCDMediationCarm(claim.claimantResponse?.mediationCarm),
    applicant1DQLanguage: toCCDWelshLanguageRequirements(claim.claimantResponse?.directionQuestionnaire?.welshLanguageRequirements),
    applicant1DQVulnerabilityQuestions: toCCDVulnerability(claim.claimantResponse?.directionQuestionnaire?.vulnerabilityQuestions),
    applicant1DQRequestedCourt: toCCDSpecificCourtLocations(claim.claimantResponse?.directionQuestionnaire?.hearing?.specificCourtLocation),
    applicant1DQWitnesses: toCCDWitnesses(claim.claimantResponse?.directionQuestionnaire?.witnesses),
    applicant1DQSmallClaimHearing: claim.isSmallClaimsTrackDQ ? toCCDSmallClaimHearing(claim.claimantResponse?.directionQuestionnaire?.hearing) : undefined,
    applicant1DQExperts: toCCDExpert(claim),
    applicant1DQHearingSupport: toCCDDQHearingSupport(claim.claimantResponse?.directionQuestionnaire?.hearing?.supportRequiredList),
    applicant1ClaimExpertSpecRequired: toCCDYesNo(claim.claimantResponse?.directionQuestionnaire?.experts?.permissionForExpert?.option),
    applicant1AcceptFullAdmitPaymentPlanSpec: (claim.isFullAdmission()) ? toCCDYesNo(claim.claimantResponse?.fullAdmitSetDateAcceptPayment?.option) : undefined,
    applicant1AcceptPartAdmitPaymentPlanSpec: (claim.isPartialAdmission()) ? toCCDYesNo(claim.claimantResponse?.fullAdmitSetDateAcceptPayment?.option) : undefined,
    applicant1PartAdmitConfirmAmountPaidSpec: toCCDYesNo(claim.claimantResponse?.hasDefendantPaidYou?.option),
    applicant1PartAdmitIntentionToSettleClaimSpec: isClaimantWantToSettleTheClaim(claim),
    applicant1RepaymentOptionForDefendantSpec: toCCDClaimantPaymentOption(claim.claimantResponse?.suggestedPaymentIntention?.paymentOption),
    applicant1FullDefenceConfirmAmountPaidSpec: (claim.isFullDefence()) ? toCCDYesNo(claim.claimantResponse?.hasDefendantPaidYou?.option) : undefined,
    applicant1ProceedWithClaim: toCCDYesNo(claim.getIntentionToProceed()),
    applicant1SettleClaim: toCCDYesNo(claim.hasClaimantNotSettled() ? YesNo.NO : YesNo.YES), // if method is true, claimant has NOT settled
    applicant1SuggestInstalmentsPaymentAmountForDefendantSpec: convertToPenceFromString(formatAmountTwoDecimalPlaces(claim.claimantResponse?.suggestedPaymentIntention?.repaymentPlan?.paymentAmount)),
    applicant1SuggestInstalmentsRepaymentFrequencyForDefendantSpec: toCCDRepaymentPlanFrequency(claim.claimantResponse?.suggestedPaymentIntention?.repaymentPlan?.repaymentFrequency),
    applicant1SuggestInstalmentsFirstRepaymentDateForDefendantSpec: toCCDClaimantSuggestedFirstRepaymentDate(claim.claimantResponse),
    applicant1RequestedPaymentDateForDefendantSpec: toCCDClaimantSuggestedPayByDate(claim.claimantResponse) ? toCCDClaimantPayBySetDate(claim.claimantResponse?.suggestedPaymentIntention?.paymentDate) : undefined,
    applicant1SuggestPayImmediatelyPaymentDateForDefendantSpec: toCCDClaimantSuggestedImmediatePaymentDateInFavourClaimant(claim.claimantResponse) ? claim.claimantResponse?.suggestedImmediatePaymentDeadLine : undefined,
    applicant1DQFixedRecoverableCostsIntermediate: toCCDFixedRecoverableCostsIntermediate(claim.claimantResponse?.directionQuestionnaire?.fixedRecoverableCosts),
    specApplicant1DQDisclosureOfElectronicDocuments: toCCDDisclosureOfElectronicDocuments(claim.claimantResponse?.directionQuestionnaire?.hearing),
    specApplicant1DQDisclosureOfNonElectronicDocuments: toCCDDisclosureOfNonElectronicDocuments(claim.claimantResponse?.directionQuestionnaire?.hearing),
    applicant1DQDefendantDocumentsToBeConsidered: convertToCCDDocumentsToBeConsidered(claim.claimantResponse?.directionQuestionnaire?.hearing),
    respondToClaimAdmitPartLRspec: respondToClaimAdmitPartLRspec,
  };
};

