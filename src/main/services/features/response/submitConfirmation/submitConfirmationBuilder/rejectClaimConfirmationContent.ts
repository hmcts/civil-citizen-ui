import {t} from 'i18next';
import {Claim} from 'models/claim';
import {ClaimSummarySection, ClaimSummaryType} from 'form/models/claimSummarySection';
import {
  isDefendantRejectedMediationOrFastTrackClaim,
} from 'services/features/response/submitConfirmation/submitConfirmationService';

export function getRC_PaidLessStatus(claim: Claim, lang: string): ClaimSummarySection[] {
  const claimantName = claim.getClaimantFullName();
  const amount = claim.isRejectAllOfClaimAlreadyPaid();
  return [
    {
      type: ClaimSummaryType.PARAGRAPH,
      data: {
        text: t('PAGES.SUBMIT_CONFIRMATION.RC_PAY_LESS.WE_EMAILED_CLAIMANT_YOUR_INTENTION', {lng: lang}),
        variables: {claimantName: claimantName,amount:amount},
      },
    },
  ];
}

export function getRC_PaidFullStatus(claim: Claim, lang: string): ClaimSummarySection[] {
  const claimantName = claim.getClaimantFullName();
  const amount = claim.isRejectAllOfClaimAlreadyPaid();
  return [
    {
      type: ClaimSummaryType.PARAGRAPH,
      data: {
        text: t('PAGES.SUBMIT_CONFIRMATION.RC_PAY_FULL.WE_EMAILED_CLAIMANT_YOUR_INTENTION', {lng: lang}),
        variables: {claimantName: claimantName,amount:amount},
      },
    },
  ];
}

export function getRC_PaidLessNextSteps(claim: Claim, lang: string): ClaimSummarySection[]{
  const claimantName = claim.getClaimantFullName();
  const isDefendantRejectedMediationOrIsFastTrackClaim = isDefendantRejectedMediationOrFastTrackClaim(claim);
  return [
    {
      type: ClaimSummaryType.HTML,
      data: {
        html: `
        <h3 class="govuk-heading-s govuk-!-margin-bottom-1">${t('PAGES.SUBMIT_CONFIRMATION.IF_CLAIMANT_ACCEPTS_RESPONSE', { claimantName, lng: lang })}</h3>
        <p class="govuk-body">${t('PAGES.SUBMIT_CONFIRMATION.THE_CLAIM_WILL_BE_SETTLED', { lng: lang })}</p>
        <h3 class="govuk-heading-s govuk-!-margin-bottom-1">${t('PAGES.SUBMIT_CONFIRMATION.IF_CLAIMANT_REJECTS_RESPONSE', { claimantName, lng: lang })}</h3>`,
        variables: {claimantName: claimantName},
      },
    },
    {...getParagraphAskMediationPaidLess(lang, isDefendantRejectedMediationOrIsFastTrackClaim)},
    {...getParagraphDontWantMediationPaidLess(lang, isDefendantRejectedMediationOrIsFastTrackClaim)},
    {
      type: ClaimSummaryType.PARAGRAPH,
      data: {
        text: t('PAGES.SUBMIT_CONFIRMATION.WE_CONTACT_YOU_FOR_WHAT_TO_DO_NEXT', {lng: lang}),
      },
    },
  ];
}

const getParagraphAskMediationPaidLess = (lang: string, isDefendantRejectedMediationOrIsFastTrackClaim?: boolean) => {
  if (isDefendantRejectedMediationOrIsFastTrackClaim) {
    return undefined;
  }
  return {
    type: ClaimSummaryType.PARAGRAPH,
    data: {
      text: t('PAGES.SUBMIT_CONFIRMATION.RC_PAY_LESS.WE_ASK_CLAIMANT_FOR_MEDIATION', {lng: lang}),
    },
  };
};

const getParagraphDontWantMediationPaidLess = (lang: string, isDefendantRejectedMediationOrIsFastTrackClaim?: boolean) => {
  const textContent = isDefendantRejectedMediationOrIsFastTrackClaim ? 'PAGES.SUBMIT_CONFIRMATION.THE_COURT_WILL_REVIEW_CASE_HEARING' : 'PAGES.SUBMIT_CONFIRMATION.RC_PAY_LESS.CLAIMANT_REFUSE_MEDIATION';
  return {
    type: ClaimSummaryType.PARAGRAPH,
    data: {
      text: t(textContent, {lng: lang}),
    },
  };
};

export function getRC_PaidFullNextSteps(claim: Claim,lang: string): ClaimSummarySection[]{
  const claimantName = claim.getClaimantFullName();
  const isDefendantRejectedMediationOrIsFastTrackClaim = isDefendantRejectedMediationOrFastTrackClaim(claim);
  return [
    {
      type: ClaimSummaryType.HTML,
      data: {
        html: `<p class="govuk-body">${t('PAGES.SUBMIT_CONFIRMATION.RC_PAY_FULL.IF_CLAIMANT_ACCEPTS_CLAIM_WILL_END', {claimantName,lng:lang})}</p>`,
        variables: {claimantName: claimantName},
      },
    },
    {...getParagraphAskMediationPaidFull(lang, claimantName, isDefendantRejectedMediationOrIsFastTrackClaim)},
    {...getParagraphDontWantMediationPaidFull(lang, isDefendantRejectedMediationOrIsFastTrackClaim)},
    {
      type: ClaimSummaryType.PARAGRAPH,
      data: {
        text: t('PAGES.SUBMIT_CONFIRMATION.WE_CONTACT_YOU_FOR_WHAT_TO_DO_NEXT', {lng: lang}),
      },
    },
  ];
}

const getParagraphAskMediationPaidFull = (lang: string, claimantName: string, isDefendantRejectedMediationOrIsFastTrackClaim?: boolean) => {
  if (isDefendantRejectedMediationOrIsFastTrackClaim) {
    return undefined;
  }
  return {
    type: ClaimSummaryType.PARAGRAPH,
    data: {
      text: t('PAGES.SUBMIT_CONFIRMATION.RC_PAY_FULL.IF_CLAIMANT_REJECTS_TRY_MEDIATION', {claimantName, lng: lang}),
    },
  };
};

const getParagraphDontWantMediationPaidFull = (lang: string, isDefendantRejectedMediationOrIsFastTrackClaim?: boolean) => {
  const textContent = isDefendantRejectedMediationOrIsFastTrackClaim ? 'PAGES.SUBMIT_CONFIRMATION.IF_CLAIMANT_REJECTS_NO_MEDIATION' : 'PAGES.SUBMIT_CONFIRMATION.RC_PAY_FULL.IF_CLAIMANT_REJECTS_COURT_WILL_REVIEW_CASE';
  return {
    type: ClaimSummaryType.PARAGRAPH,
    data: {
      text: t(textContent, {lng: lang}),
    },
  };
};
