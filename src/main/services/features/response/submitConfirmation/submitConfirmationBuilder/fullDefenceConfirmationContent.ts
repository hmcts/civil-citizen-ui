import {t} from 'i18next';
import {Claim} from 'models/claim';
import {ClaimSummarySection, ClaimSummaryType} from 'form/models/claimSummarySection';
import {
  isDefendantRejectedMediationOrFastTrackClaim,
} from 'services/features/response/submitConfirmation/submitConfirmationService';

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

export const getRCDisputeNextSteps = (claimId: string, claim: Claim, lng: string): ClaimSummarySection[] => {
  const claimantName = claim.getClaimantFullName();
  const isDefendantRejectedMediationOrIsFastTrackClaim = isDefendantRejectedMediationOrFastTrackClaim(claim);
  return [
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
    {...getParagraphAskMediation(lng, claimantName, isDefendantRejectedMediationOrIsFastTrackClaim)},
    {...getParagraphDontWantMediation(lng, isDefendantRejectedMediationOrIsFastTrackClaim)},
  ];
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
