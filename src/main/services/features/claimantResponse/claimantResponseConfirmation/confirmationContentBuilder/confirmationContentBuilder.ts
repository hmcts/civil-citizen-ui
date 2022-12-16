import {ClaimSummarySection} from 'common/form/models/claimSummarySection';
import {YesNo} from 'common/form/models/yesNo';
import {Claim} from 'common/models/claim';
import {ClaimResponseStatus} from 'common/models/claimResponseStatus';
import {getClaimantResponseStatus, getRCDisputeNotContinueNextSteps} from './disputeConfirmationContentBuilder';

export function buildClaimantResponseSection(claim: Claim, lang: string): ClaimSummarySection[] {
  const RCDisputeNotContinueStatus = getClaimantResponseStatus(claim, 'PAGES.CLAIMANT_RESPONSE_CONFIRMATION.RC_DISPUTE.NOT_PROCEED_WITH_CLAIM', lang);

  if (claim.claimantResponse?.intentionToProceed?.option === YesNo.NO) {
    return RCDisputeNotContinueStatus;
  }
}

export function buildNextStepsSection(claim: Claim, lang: string): ClaimSummarySection[] {
  const RCDisputeNotContinueNextSteps = getRCDisputeNotContinueNextSteps(claim, lang);

  if (claim.responseStatus === ClaimResponseStatus.RC_DISPUTE && claim.claimantResponse?.intentionToProceed.option === YesNo.NO) {
    return RCDisputeNotContinueNextSteps;
  }
}