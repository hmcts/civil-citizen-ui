import {ClaimSummarySection} from 'common/form/models/claimSummarySection';
import {Claim} from 'common/models/claim';
import {ClaimResponseStatus} from 'common/models/claimResponseStatus';
import {getClaimantResponseStatus, getRCDisputeNotContinueNextSteps} from './disputeConfirmationContentBuilder';
import {getPAPayImmediatelyAcceptedNextSteps} from './partAdmitConfirmationContentBuilder';
import {ClaimantResponse} from 'common/models/claimantResponse';
import {getSignSettlementAgreementNextSteps} from './signSettlementAgreementContentBuilder';

export function buildClaimantResponseSection(claim: Claim, lang: string): ClaimSummarySection[] {
  const claimantResponse = Object.assign(new ClaimantResponse(), claim.claimantResponse);
  let claimantResponseStatusTitle: string;
  if (claimantResponse.isSignSettlementAgreement) {
    claimantResponseStatusTitle = 'PAGES.CLAIMANT_RESPONSE_CONFIRMATION.SIGN_SETTLEMENT_AGREEMENT.TITLE';
  } else if (claimantResponse.isClaimantNotIntendedToProceed) {
    claimantResponseStatusTitle = 'PAGES.CLAIMANT_RESPONSE_CONFIRMATION.RC_DISPUTE.NOT_PROCEED_WITH_CLAIM';
  } else if (claimantResponse.isClaimantAcceptedPartAdmittedAmount) {
    claimantResponseStatusTitle = 'PAGES.CLAIMANT_RESPONSE_CONFIRMATION.PA_PAY_IMMEDIATELY.ACCEPTED_DEFENDANT_RESPONSE';
  }
  return getClaimantResponseStatus(claim, claimantResponseStatusTitle, lang);
}

export function buildNextStepsSection(claim: Claim, lang: string): ClaimSummarySection[] {
  const claimantResponse = Object.assign(new ClaimantResponse(), claim.claimantResponse);
  const RCDisputeNotContinueNextSteps = getRCDisputeNotContinueNextSteps(claim, lang);
  const PAPayImmediatelyAcceptedNextSteps = getPAPayImmediatelyAcceptedNextSteps(claim, lang);
  const SignSettlementAgreementNextSteps = getSignSettlementAgreementNextSteps(claim, lang);

  if (claimantResponse.isSignSettlementAgreement) {
    return SignSettlementAgreementNextSteps;
  }
  if (claim.responseStatus === ClaimResponseStatus.RC_DISPUTE && claimantResponse.isClaimantNotIntendedToProceed) {
    return RCDisputeNotContinueNextSteps;
  }
  if (claim.responseStatus === ClaimResponseStatus.PA_NOT_PAID_PAY_IMMEDIATELY && claimantResponse.isClaimantAcceptedPartAdmittedAmount) {
    return PAPayImmediatelyAcceptedNextSteps;
  }
}
