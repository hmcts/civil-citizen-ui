import {ClaimSummarySection} from 'common/form/models/claimSummarySection';
import {Claim} from 'common/models/claim';
import {ClaimResponseStatus} from 'common/models/claimResponseStatus';
import {getClaimantResponseStatus, getRCDisputeNotContinueNextSteps} from './disputeConfirmationContentBuilder';
import {getPAPayImmediatelyAcceptedNextSteps, getRejectedResponseNoMediationNextSteps} from './partAdmitConfirmationContentBuilder';
import {ClaimantResponse} from 'common/models/claimantResponse';

export function buildClaimantResponseSection(claim: Claim, lang: string): ClaimSummarySection[] {
  const claimantResponse = Object.assign(new ClaimantResponse(), claim.claimantResponse);
  let claimantResponseStatusTitle: string;

  if (claimantResponse.isClaimantNotIntendedToProceed) {
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
  const RejectedResponseNoMediationNextSteps = getRejectedResponseNoMediationNextSteps(lang);

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

function hasClaimantRejectedDefendantResponse(claim: Claim): boolean {
  if (claim.hasClaimantNotAgreedToMediation() || claim.hasRespondent1NotAgreedMediation()) {
    if (claim.isFullDefence() && claim.hasClaimantRejectedDefendantPaid()) {
      return true;
    } else if (claim.responseStatus === ClaimResponseStatus.PA_NOT_PAID_NOT_ACCEPTED || claim.responseStatus === ClaimResponseStatus.PA_ALREADY_PAID_NOT_ACCEPTED
      || claim.responseStatus === ClaimResponseStatus.PA_ALREADY_PAID_ACCEPTED_NOT_SETTLED || claim.responseStatus === ClaimResponseStatus.RC_DISPUTE_CLAIMANT_INTENDS_TO_PROCEED) {
      return true;
    }
  }

  return false;
}
