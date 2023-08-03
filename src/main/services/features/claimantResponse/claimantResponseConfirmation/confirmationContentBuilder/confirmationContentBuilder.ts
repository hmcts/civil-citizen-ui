import {ClaimSummarySection} from 'common/form/models/claimSummarySection';
import {YesNo} from 'common/form/models/yesNo';
import {Claim} from 'common/models/claim';
import {ClaimResponseStatus} from 'common/models/claimResponseStatus';
import {getClaimantResponseStatus, getRCDisputeNotContinueNextSteps} from './disputeConfirmationContentBuilder';
import {getPAPayImmediatelyAcceptedNextSteps} from './partAdmitConfirmationContentBuilder';

export function buildClaimantResponseSection(claim: Claim, lang: string): ClaimSummarySection[] {
  const RCDisputeNotContinueStatus = getClaimantResponseStatus(claim, 'PAGES.CLAIMANT_RESPONSE_CONFIRMATION.RC_DISPUTE.NOT_PROCEED_WITH_CLAIM', lang);
  const PAPayImmediatelyAcceptedStatus = getClaimantResponseStatus(claim, 'PAGES.CLAIMANT_RESPONSE_CONFIRMATION.PA_PAY_IMMEDIATELY.ACCEPTED_DEFENDANT_RESPONSE', lang);

  if (claim.claimantResponse?.intentionToProceed?.option === YesNo.NO) {
    return RCDisputeNotContinueStatus;
  } else if (claim.responseStatus === ClaimResponseStatus.PA_NOT_PAID_PAY_IMMEDIATELY && claim.claimantResponse?.hasPartAdmittedBeenAccepted?.option === YesNo.YES) {
    return PAPayImmediatelyAcceptedStatus;
  }
}

export function buildNextStepsSection(claim: Claim, lang: string): ClaimSummarySection[] {
  const RCDisputeNotContinueNextSteps = getRCDisputeNotContinueNextSteps(claim, lang);
  const PAPayImmediatelyAcceptedNextSteps = getPAPayImmediatelyAcceptedNextSteps(claim, lang);

  if (claim.responseStatus === ClaimResponseStatus.RC_DISPUTE && claim.claimantResponse?.intentionToProceed?.option === YesNo.NO) {
    return RCDisputeNotContinueNextSteps;
  } else if (claim.responseStatus === ClaimResponseStatus.PA_NOT_PAID_PAY_IMMEDIATELY && claim.claimantResponse?.hasPartAdmittedBeenAccepted?.option === YesNo.YES) {
    return PAPayImmediatelyAcceptedNextSteps;
  }
}
