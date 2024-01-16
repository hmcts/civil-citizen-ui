import {t} from 'i18next';
import {Claim} from 'models/claim';
import {ClaimSummarySection, ClaimSummaryType} from 'form/models/claimSummarySection';
import {
  isDefendantRejectedMediationOrFastTrackClaim,
} from 'services/features/response/submitConfirmation/submitConfirmationService';
import {
  getMediationCarmParagraph,
} from 'services/features/response/submitConfirmation/submitConfirmationBuilder/mediationCarmContent';
import {isCarmApplicableAndSmallClaim} from 'common/utils/carmToggleUtils';

export const getRCDisputeStatus = (claim: Claim, lng: string): ClaimSummarySection[] => {
  const claimantName = claim.getClaimantFullName();
  return [
    {
      type: ClaimSummaryType.PARAGRAPH,
      data: {
        text: t('PAGES.SUBMIT_CONFIRMATION.RC_DISPUTE.WE_HAVE_MAILED', {claimantName, lng}),
      },
    },
  ];
};

export const getRCDisputeNextSteps = (claimId: string, claim: Claim, lng: string, carmApplicable = false): ClaimSummarySection[] => {
  const claimantName = claim.getClaimantFullName();
  const isDefendantRejectedMediationOrIsFastTrackClaim = isDefendantRejectedMediationOrFastTrackClaim(claim);
  const content: ClaimSummarySection[] = [
    {
      type: ClaimSummaryType.PARAGRAPH,
      data: {
        text: t('PAGES.SUBMIT_CONFIRMATION.RC_DISPUTE.WE_WILL_CONTACT', {claimantName, lng}),
      },
    },
    {
      type: ClaimSummaryType.PARAGRAPH,
      data: {
        text: t('PAGES.SUBMIT_CONFIRMATION.RC_DISPUTE.IF_CLAIMANT_ACCEPTS', {claimantName, lng}),
      },
    },
  ];
  if (isCarmApplicableAndSmallClaim(carmApplicable, claim)){
    getMediationCarmParagraph(lng, claimantName, true).forEach((element) => content.push(element));
  } else {
    content.push(getParagraphAskMediation(lng, claimantName, isDefendantRejectedMediationOrIsFastTrackClaim));
    content.push(getParagraphDontWantMediation(lng, isDefendantRejectedMediationOrIsFastTrackClaim));
  }
  return content;
};

const getParagraphAskMediation = (lang: string, claimantName: string, isDefendantRejectedMediationOrIsFastTrackClaim?: boolean) => {
  if (isDefendantRejectedMediationOrIsFastTrackClaim) {
    return undefined;
  }
  return {
    type: ClaimSummaryType.PARAGRAPH,
    data: {
      text: t('PAGES.SUBMIT_CONFIRMATION.RC_DISPUTE.IF_CLAIMANT_REJECTS', {claimantName, lng: lang}),
    },
  };
};

const getParagraphDontWantMediation = (lang: string, isDefendantRejectedMediationOrIsFastTrackClaim?: boolean) => {
  const textContent = isDefendantRejectedMediationOrIsFastTrackClaim ? 'PAGES.SUBMIT_CONFIRMATION.IF_CLAIMANT_REJECTS_NO_MEDIATION' : 'PAGES.SUBMIT_CONFIRMATION.RC_DISPUTE.IF_THEY_REJECT';
  return {
    type: ClaimSummaryType.PARAGRAPH,
    data: {
      text: t(textContent, {lng: lang}),
    },
  };
};
