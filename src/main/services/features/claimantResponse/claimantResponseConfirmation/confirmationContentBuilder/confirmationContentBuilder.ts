import {ClaimSummarySection} from 'common/form/models/claimSummarySection';
import {Claim} from 'common/models/claim';
import {ClaimResponseStatus} from 'common/models/claimResponseStatus';
import {getClaimantResponseStatus, getRCDisputeNotContinueNextSteps} from './disputeConfirmationContentBuilder';
import {getPAPayImmediatelyAcceptedNextSteps, getRejectedResponseNoMediationNextSteps} from './partAdmitConfirmationContentBuilder';
import {ClaimantResponse} from 'common/models/claimantResponse';
import {getSignSettlementAgreementNextSteps} from './signSettlementAgreementContentBuilder';
import { YesNo } from 'common/form/models/yesNo';
// import {PaymentOptionType} from 'form/models/admission/paymentOption/paymentOptionType';
import {
  getCourtBelievesCanAfford,
  getCourtBelievesCanntAfford,
  getSendFinancialDetails,
  getUseThisAddress,
} from './financialDetailsBuilder';
// import { CourtProposedPlanOptions } from 'common/form/models/claimantResponse/courtProposedPlan';

export function buildClaimantResponseSection(claim: Claim, lang: string): ClaimSummarySection[] {
  const claimantResponse = Object.assign(new ClaimantResponse(), claim.claimantResponse);
  let claimantResponseStatusTitle: string;
  if (claimantResponse.isSignSettlementAgreement) {
    claimantResponseStatusTitle = 'PAGES.CLAIMANT_RESPONSE_CONFIRMATION.SIGN_SETTLEMENT_AGREEMENT.TITLE';
  } else if (claimantResponse.isClaimantNotIntendedToProceed) {
    claimantResponseStatusTitle = 'PAGES.CLAIMANT_RESPONSE_CONFIRMATION.RC_DISPUTE.NOT_PROCEED_WITH_CLAIM';
  } else if (claimantResponse.isClaimantAcceptedPartAdmittedAmount) {
    claimantResponseStatusTitle = 'PAGES.CLAIMANT_RESPONSE_CONFIRMATION.PA_PAY_IMMEDIATELY.ACCEPTED_DEFENDANT_RESPONSE';
  } else if (hasClaimantRejectedDefendantResponse(claim)) {
    claimantResponseStatusTitle = 'PAGES.CLAIMANT_RESPONSE_CONFIRMATION.REJECTED_DEFENDANT_RESPONSE.MESSAGE';
  }

  return getClaimantResponseStatus(claim, claimantResponseStatusTitle, lang);
}

export function buildNextStepsSection(claim: Claim, lang: string): ClaimSummarySection[] {
  const claimantResponse = Object.assign(new ClaimantResponse(), claim.claimantResponse);
  const RCDisputeNotContinueNextSteps = getRCDisputeNotContinueNextSteps(claim, lang);
  const PAPayImmediatelyAcceptedNextSteps = getPAPayImmediatelyAcceptedNextSteps(claim, lang);
  const SignSettlementAgreementNextSteps = getSignSettlementAgreementNextSteps(claim, lang);
  const RejectedResponseNoMediationNextSteps = getRejectedResponseNoMediationNextSteps(lang);

  if (claimantResponse.isSignSettlementAgreement) {
    return SignSettlementAgreementNextSteps;
  }
  if (claim.responseStatus === ClaimResponseStatus.RC_DISPUTE && claimantResponse.isClaimantNotIntendedToProceed) {
    return RCDisputeNotContinueNextSteps;
  }

  if (claim.responseStatus === ClaimResponseStatus.PA_NOT_PAID_PAY_IMMEDIATELY && claimantResponse.isClaimantAcceptedPartAdmittedAmount) {
    return PAPayImmediatelyAcceptedNextSteps;
  }

  if (hasClaimantRejectedDefendantResponse(claim)) {
    return RejectedResponseNoMediationNextSteps;
  }
}

export function buildSendFinancialDetailsSection(claim: Claim, lang: string): ClaimSummarySection[] {
  // TODO: WIP

  // AND the defence was a Part Admit Not Paid (e.g. immediately or Instalments or Set Date)
  // AND No mediation opted
  // AND Claimant rejects the response
  // AND Court accepts the claimant new repayment plan

  // if (
  //   claim.isBusiness() &&
  //   claim.isPartialAdmissionNotPaid() &&
  //   !claim.isDefendantAgreedForMediation() &&
  //   isClaimantRejectPaymentPlan(claim) &&
  //   claim.claimantResponse.courtProposedPlan.decision === CourtProposedPlanOptions.ACCEPT_REPAYMENT_PLAN
  //   ) {
  //   console.log('DENTRO');
    
  // }

  const sendFinancialDetails = getSendFinancialDetails(claim, lang);
  if (claim) {
    return sendFinancialDetails;
  }
}

export function buildUseThisAddressSection(claim: Claim, lang: string): ClaimSummarySection[] {
  // TODO: WIP
  const useThisAddress = getUseThisAddress(lang);
  if (claim) {
    return useThisAddress;
  }
}

export function buildCourtBelievesCanAffordSection(claim: Claim, lang: string): ClaimSummarySection[] {
  // TODO: WIP
  const courtBelievesCanAfford = getCourtBelievesCanAfford(lang);
  if (claim) {
    return courtBelievesCanAfford;
  }
}

export function buildCourtBelievesCanntAffordSection(claim: Claim, lang: string): ClaimSummarySection[] {
  // TODO: WIP
  const courtBelievesCanntAfford = getCourtBelievesCanntAfford(lang);
  if (claim) {
    return courtBelievesCanntAfford;
  }
}

function hasClaimantRejectedDefendantResponse(claim: Claim): boolean {
  const hasMediationDisagreement = claim.hasClaimantNotAgreedToMediation() || claim.hasRespondent1NotAgreedMediation();
  const isFullDefenceWithClaimantRejected = claim.isFullDefence() && claim.hasClaimantRejectedDefendantPaid();

  const claimantResponseStatus = [
    ClaimResponseStatus.PA_NOT_PAID_NOT_ACCEPTED,
    ClaimResponseStatus.PA_ALREADY_PAID_NOT_ACCEPTED,
    ClaimResponseStatus.PA_ALREADY_PAID_ACCEPTED_NOT_SETTLED,
    ClaimResponseStatus.RC_DISPUTE_CLAIMANT_INTENDS_TO_PROCEED];

  return hasMediationDisagreement && (isFullDefenceWithClaimantRejected || isFullDefenceWithIntentionToProceed(claim) || claimantResponseStatus.includes(claim.responseStatus));

}

function isFullDefenceWithIntentionToProceed(claim: Claim): boolean {
  return (
    claim.isFullDefence() &&
    claim.claimantResponse?.intentionToProceed?.option === YesNo.YES
  );
}
