import {ClaimSummarySection} from 'common/form/models/claimSummarySection';
import {Claim} from 'common/models/claim';
import {ClaimResponseStatus} from 'common/models/claimResponseStatus';
import {getClaimantResponseStatus, getRCDisputeNotContinueNextSteps} from './disputeConfirmationContentBuilder';
import {getPAPayImmediatelyAcceptedNextSteps, getRejectedResponseNoMediationNextSteps, getRejectedResponseYesMediationNextSteps} from './partAdmitConfirmationContentBuilder';
import {ClaimantResponse} from 'common/models/claimantResponse';
import {
  getCCJNextSteps,
} from 'services/features/claimantResponse/claimantResponseConfirmation/confirmationContentBuilder/ccjConfirmationBuilder';
import {getSignSettlementAgreementNextSteps} from './signSettlementAgreementContentBuilder';
import { YesNo } from 'common/form/models/yesNo';
import {PaymentOptionType} from 'form/models/admission/paymentOption/paymentOptionType';

export function buildClaimantResponseSection(claim: Claim, lang: string): ClaimSummarySection[] {
  const claimantResponse = Object.assign(new ClaimantResponse(), claim.claimantResponse);
  let claimantResponseStatusTitle: string;
  if (isClaimantRejectPaymentPlan(claim)) {
    claimantResponseStatusTitle = 'PAGES.CLAIMANT_RESPONSE_CONFIRMATION.REJECTED_PAYMENT_PLAN.MESSAGE';
  } else if (claimantResponse.isSignSettlementAgreement) {
    claimantResponseStatusTitle = 'PAGES.CLAIMANT_RESPONSE_CONFIRMATION.SIGN_SETTLEMENT_AGREEMENT.TITLE';
  } else if (claimantResponse.isClaimantNotIntendedToProceed) {
    claimantResponseStatusTitle = 'PAGES.CLAIMANT_RESPONSE_CONFIRMATION.RC_DISPUTE.NOT_PROCEED_WITH_CLAIM';
  } else if (claimantResponse.isClaimantAcceptedPartAdmittedAmount) {
    claimantResponseStatusTitle = 'PAGES.CLAIMANT_RESPONSE_CONFIRMATION.PA_PAY_IMMEDIATELY.ACCEPTED_DEFENDANT_RESPONSE';
  } else if (claimantResponse.isClaimantAcceptedPaymentPlan && claimantResponse.isCCJRequested) {
    claimantResponseStatusTitle = 'PAGES.CLAIMANT_RESPONSE_CONFIRMATION.CCJ.CCJ_REQUESTED';
  } else if (hasClaimantRejectedDefendantResponse(claim)) {
    claimantResponseStatusTitle = 'PAGES.CLAIMANT_RESPONSE_CONFIRMATION.REJECTED_DEFENDANT_RESPONSE.MESSAGE';
  }

  return getClaimantResponseStatus(claim, claimantResponseStatusTitle, lang);
}

export function buildNextStepsSection(claim: Claim, lang: string): ClaimSummarySection[] {
  const claimantResponse = Object.assign(new ClaimantResponse(), claim.claimantResponse);
  const RCDisputeNotContinueNextSteps = getRCDisputeNotContinueNextSteps(claim, lang);
  const PAPayImmediatelyAcceptedNextSteps = getPAPayImmediatelyAcceptedNextSteps(claim, lang);
  const ccjNextSteps = getCCJNextSteps(claim, lang);
  const SignSettlementAgreementNextSteps = getSignSettlementAgreementNextSteps(claim, lang);
  const RejectedResponseNoMediationNextSteps = getRejectedResponseNoMediationNextSteps(lang);
  const RejectedResponseYesMediationNextSteps = getRejectedResponseYesMediationNextSteps(lang);

  if (claimantResponse.isSignSettlementAgreement || isClaimantRejectPaymentPlan(claim)) {
    return SignSettlementAgreementNextSteps;
  }
  if (claim.responseStatus === ClaimResponseStatus.RC_DISPUTE && claimantResponse.isClaimantNotIntendedToProceed) {
    return RCDisputeNotContinueNextSteps;
  }

  if (claim.responseStatus === ClaimResponseStatus.PA_NOT_PAID_PAY_IMMEDIATELY && claimantResponse.isClaimantAcceptedPartAdmittedAmount) {
    return PAPayImmediatelyAcceptedNextSteps;
  }
  if (claimantResponse.isClaimantAcceptedPaymentPlan && claimantResponse.isCCJRequested) {
    return ccjNextSteps;
  }

  if (hasClaimantRejectedDefendantResponse(claim)) {
    if(hasEitherPartyNotAgreedToMediation(claim)) {
      return RejectedResponseNoMediationNextSteps;
    }
    else if(claim.hasClaimantAgreedToMediation()) {
      return RejectedResponseYesMediationNextSteps;
    }
  }
}

function hasClaimantRejectedDefendantResponse(claim: Claim): boolean {
  const isFullDefenceWithClaimantRejected =
    claim.isFullDefence() && claim.hasClaimantRejectedDefendantPaid();

  const claimantResponseStatus = [
    ClaimResponseStatus.PA_NOT_PAID_NOT_ACCEPTED,
    ClaimResponseStatus.PA_ALREADY_PAID_NOT_ACCEPTED,
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
  return (
    claim.hasClaimantNotAgreedToMediation() ||
    claim.hasRespondent1NotAgreedMediation()
  );
}

function isFullDefenceWithIntentionToProceed(claim: Claim): boolean {
  return (
    claim.isFullDefence() &&
    claim.claimantResponse?.intentionToProceed?.option === YesNo.YES
  );
}

function isClaimantRejectPaymentPlan(claim: Claim): boolean {
  return (claim.claimantResponse?.suggestedPaymentIntention?.paymentOption === PaymentOptionType.IMMEDIATELY
    || claim.claimantResponse?.suggestedPaymentIntention?.paymentOption === PaymentOptionType.BY_SET_DATE
    || claim.claimantResponse?.suggestedPaymentIntention?.paymentOption === PaymentOptionType.INSTALMENTS);
}
