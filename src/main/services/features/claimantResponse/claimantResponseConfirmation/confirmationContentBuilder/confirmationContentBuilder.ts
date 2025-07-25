import {ClaimSummarySection} from 'common/form/models/claimSummarySection';
import {Claim} from 'common/models/claim';
import {ClaimResponseStatus} from 'common/models/claimResponseStatus';
import {getClaimantResponseStatus, getRCDisputeNotContinueNextSteps} from './disputeConfirmationContentBuilder';
import {
  getPAPayImmediatelyAcceptedNextSteps, getRejectedResponseMintiTracksNextSteps,
  getRejectedResponseNoMediationNextSteps,
  getRejectedResponseYesMediationNextSteps,
} from './partAdmitConfirmationContentBuilder';
import {ClaimantResponse} from 'common/models/claimantResponse';
import {
  getCCJNextSteps,
  getCCJNextStepsForJudgeDecideRepaymentPlan,
  getCCJNextStepsForRejectedRepaymentPlan,
} from 'services/features/claimantResponse/claimantResponseConfirmation/confirmationContentBuilder/ccjConfirmationBuilder';
import {getSignSettlementAgreementNextSteps} from './signSettlementAgreementContentBuilder';
import {getSendFinancialDetails} from './financialDetailsBuilder';
import {CaseState} from 'common/form/models/claimDetails';
import {YesNo} from 'form/models/yesNo';
import {getClaimSettleNextSteps} from './claimSettleConfirmationBuilder';
import {
  getMediationCarmNextSteps,
} from 'services/features/claimantResponse/claimantResponseConfirmation/confirmationContentBuilder/mediationConfirmationContentBuilder';

export function buildClaimantResponseSection(claim: Claim, lang: string): ClaimSummarySection[] {
  const claimantResponse = Object.assign(new ClaimantResponse(), claim.claimantResponse);
  let claimantResponseStatusTitle: string;
  if (isClaimantRejectPaymentPlan(claim) && !claimantResponse.isCCJRepaymentPlanConfirmationPageAllowed() &&
    (claimantResponse.isClaimantRejectedCourtDecision || claim.isBusiness())) {
    claimantResponseStatusTitle = 'PAGES.CLAIMANT_RESPONSE_CONFIRMATION.REJECTED_PAYMENT_PLAN.MESSAGE';
  } else if (claimantResponse.isSignASettlementAgreement) {
    claimantResponseStatusTitle = 'PAGES.CLAIMANT_RESPONSE_CONFIRMATION.SIGN_SETTLEMENT_AGREEMENT.TITLE';
  } else if (claimantResponse.isClaimantNotIntendedToProceed) {
    claimantResponseStatusTitle = 'PAGES.CLAIMANT_RESPONSE_CONFIRMATION.RC_DISPUTE.NOT_PROCEED_WITH_CLAIM';
  } else if (claimantResponse.isClaimantAcceptedPartAdmittedAmount && !claimantResponse.isCCJRepaymentPlanConfirmationPageAllowed() &&
    !claimantResponse.isClaimantRejectedCourtDecision || claim.hasClaimantAcceptedToSettleClaim()) {
    claimantResponseStatusTitle = 'PAGES.CLAIMANT_RESPONSE_CONFIRMATION.PA_PAY_IMMEDIATELY.ACCEPTED_DEFENDANT_RESPONSE';
  } else if (hasCCJRequested(claimantResponse)) {
    claimantResponseStatusTitle = 'PAGES.CLAIMANT_RESPONSE_CONFIRMATION.CCJ.CCJ_REQUESTED';
  } else if (hasClaimantRejectedDefendantResponse(claim)) {
    claimantResponseStatusTitle = 'PAGES.CLAIMANT_RESPONSE_CONFIRMATION.REJECTED_DEFENDANT_RESPONSE.MESSAGE';
  }

  return getClaimantResponseStatus(claim, claimantResponseStatusTitle, lang);
}

export function buildNextStepsSection(claim: Claim, lang: string, carmApplicable: boolean, mintiApplicable: boolean, respondToSettlementAgreementDeadLine?: Date): ClaimSummarySection[] {
  const claimantResponse = Object.assign(new ClaimantResponse(), claim.claimantResponse);
  const RCDisputeNotContinueNextSteps = getRCDisputeNotContinueNextSteps(claim, lang);
  const PAPayImmediatelyAcceptedNextSteps = getPAPayImmediatelyAcceptedNextSteps(claim, lang);
  const ccjNextSteps = getCCJNextSteps(claim, lang);
  const SignSettlementAgreementNextSteps = getSignSettlementAgreementNextSteps(claim, lang, respondToSettlementAgreementDeadLine);
  const RejectedResponseNoMediationNextSteps = getRejectedResponseNoMediationNextSteps(lang);
  const RejectedResponseYesMediationNextSteps = getRejectedResponseYesMediationNextSteps(lang);
  const RejectedResponseCarmMediationNextSteps = getMediationCarmNextSteps(lang);
  const rejectedRepaymentPlaneNextSteps = getCCJNextStepsForRejectedRepaymentPlan(claim, lang);
  const rejectedAndJudgeDecideRepaymentPlan = getCCJNextStepsForJudgeDecideRepaymentPlan(claim, lang);
  const sendFinancialDetails = getSendFinancialDetails(claim, lang);
  const acceptedResponseToSettle = getClaimSettleNextSteps(claim, lang);
  const rejectedResponseMultiIntTrackNextSteps = getRejectedResponseMintiTracksNextSteps(lang);

  if (mintiApplicable && claim.hasClaimantNotSettled()) {
    return rejectedResponseMultiIntTrackNextSteps;
  }

  if (carmApplicable && claim.hasClaimantNotSettled() && claim.isSmallClaimsTrackDQ) {
    return RejectedResponseCarmMediationNextSteps;
  }

  if (claim.isBusiness() &&
    (claim.isFAPaymentOptionInstallments() ||
    claim.isFAPaymentOptionBySetDate() ||
    claim.isPAPaymentOptionInstallments() ||
    claim.isPAPaymentOptionByDate()) &&
    claim.isClaimantRejectedPaymentPlan()) {
    return sendFinancialDetails;
  }

  if (((claimantResponse.isSignSettlementAgreement || isClaimantRejectPaymentPlan(claim)) && claimantResponse.isSignASettlementAgreement)
    || (claim.claimantResponse.isClaimantAcceptedPaymentPlan && claimantResponse.isSignASettlementAgreement)) {
    return SignSettlementAgreementNextSteps;
  }
  if (claim.responseStatus === ClaimResponseStatus.RC_DISPUTE && claimantResponse.isClaimantNotIntendedToProceed) {
    return RCDisputeNotContinueNextSteps;
  }

  if (claim.responseStatus === ClaimResponseStatus.PA_NOT_PAID_PAY_IMMEDIATELY_ACCEPTED && claimantResponse.isClaimantAcceptedPartAdmittedAmount) {
    return PAPayImmediatelyAcceptedNextSteps;
  }
  if (claimantResponse.isClaimantAcceptedPaymentPlan && claimantResponse.isCCJRequested) {
    return ccjNextSteps;
  }

  if (claimantResponse.isCCJRepaymentPlanConfirmationPageAllowed()) {
    return rejectedRepaymentPlaneNextSteps;
  }

  if (claimantResponse.isCCJRepaymentPlanConfirmationPageAllowed()) {
    return rejectedRepaymentPlaneNextSteps;
  }

  if (claimantResponse.isClaimantRejectedCourtDecision) {
    return rejectedAndJudgeDecideRepaymentPlan;
  }

  if(claim.hasClaimantAcceptedToSettleClaim()) {
    return acceptedResponseToSettle;
  }

  if (hasClaimantRejectedDefendantResponse(claim)) {
    if(hasEitherPartyNotAgreedToMediation(claim) || claim.isFastTrackClaim) {
      return RejectedResponseNoMediationNextSteps;
    }
    else if(claimantResponse.hasClaimantAgreedToMediation()) {
      return RejectedResponseYesMediationNextSteps;
    }
  }
  if (claim.ccdState === CaseState.IN_MEDIATION) {
    return RejectedResponseYesMediationNextSteps;
  }
}

function hasClaimantRejectedDefendantResponse(claim: Claim): boolean {
  const isFullDefenceWithClaimantRejected =
    claim.isFullDefence() && (claim.hasClaimantRejectedDefendantPaid() || claim.hasClaimantRejectedDefendantResponse());

  const claimantResponseStatus = [
    ClaimResponseStatus.PA_NOT_PAID_NOT_ACCEPTED,
    ClaimResponseStatus.PA_ALREADY_PAID_NOT_ACCEPTED,
    ClaimResponseStatus.PA_NOT_PAID_PAY_IMMEDIATELY,
    ClaimResponseStatus.PA_ALREADY_PAID_ACCEPTED_NOT_SETTLED,
    ClaimResponseStatus.RC_DISPUTE_CLAIMANT_INTENDS_TO_PROCEED,
    ClaimResponseStatus.RC_PAID_FULL,
    ClaimResponseStatus.RC_PAID_LESS,
  ];

  return (
    isFullDefenceWithClaimantRejected ||
    isFullDefenceWithIntentionToProceed(claim) ||
    claimantResponseStatus.includes(claim.responseStatus)
  );
}

function hasEitherPartyNotAgreedToMediation(claim: Claim): boolean {
  const claimantResponse = Object.assign(new ClaimantResponse(), claim.claimantResponse);
  return (
    claimantResponse.hasClaimantNotAgreedToMediation() ||
    claim.hasRespondent1NotAgreedMediation()
  );
}

function isFullDefenceWithIntentionToProceed(claim: Claim): boolean {
  return (
    claim.isFullDefence() &&
    claim.hasClaimantIntentToProceedResponse()
  );
}

function isClaimantRejectPaymentPlan(claim: Claim): boolean {
  return claim.claimantResponse?.fullAdmitSetDateAcceptPayment?.option === YesNo.NO;
}

function hasCCJRequested(claimantResponse: ClaimantResponse): boolean {
  return (
    (claimantResponse.isClaimantAcceptedPaymentPlan && claimantResponse.isCCJRequested) ||
    claimantResponse.isCCJRepaymentPlanConfirmationPageAllowed() ||
    claimantResponse.isClaimantRejectedCourtDecision
  );
}
