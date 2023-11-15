import {t} from 'i18next';
import {Claim} from '../../../../../common/models/claim';
import {ClaimSummarySection, ClaimSummaryType} from '../../../../../common/form/models/claimSummarySection';

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
    {
      type: ClaimSummaryType.PARAGRAPH,
      data: {
        text: t('PAGES.SUBMIT_CONFIRMATION.RC_DISPUTE.IF_CLAIMANT_REJECTS', {claimantName, lng}),
      },
    },
    {
      type: ClaimSummaryType.PARAGRAPH,
      data: {
        text: t('PAGES.SUBMIT_CONFIRMATION.RC_DISPUTE.IF_THEY_REJECT', {lng}),
      },
    },
  ];
};
