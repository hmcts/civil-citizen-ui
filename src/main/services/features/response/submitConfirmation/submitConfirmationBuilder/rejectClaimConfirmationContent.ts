import {t} from 'i18next';
import {Claim} from '../../../../../common/models/claim';
import {ClaimSummarySection, ClaimSummaryType} from '../../../../../common/form/models/claimSummarySection';

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
  return [
    {
      type: ClaimSummaryType.HTML,
      data: {
        html: `
        <h3 class="govuk-heading-s govuk-!-margin-bottom-1">${t('PAGES.SUBMIT_CONFIRMATION.IF_CLAIMANT_ACCEPTS_RESPONSE', { claimantName, lng: lang })}</h3>
        <p class="govuk-body">${t('PAGES.SUBMIT_CONFIRMATION.THE_CLAIM_WILL_BE_SETTLED', { lng: lang })}</p>
        <h3 class="govuk-heading-s govuk-!-margin-bottom-1">${t('PAGES.SUBMIT_CONFIRMATION.IF_CLAIMANT_REJECTS_RESPONSE', { claimantName, lng: lang })}</h3>
        <p class="govuk-body">${t('PAGES.SUBMIT_CONFIRMATION.RC_PAY_LESS.WE_ASK_CLAIMANT_FOR_MEDIATION', { lng: lang })}</p>
        <p class="govuk-body">${t('PAGES.SUBMIT_CONFIRMATION.RC_PAY_LESS.CLAIMANT_REFUSE_MEDIATION', { lng: lang })}</p>
        <p class="govuk-body">${t('PAGES.SUBMIT_CONFIRMATION.WE_CONTACT_YOU_FOR_WHAT_TO_DO_NEXT', { lng: lang })}</p>`,
        variables: {claimantName: claimantName},
      },
    },
  ];
}

export function getRC_PaidFullNextSteps(claim: Claim,lang: string): ClaimSummarySection[]{
  const claimantName = claim.getClaimantFullName();
  return [
    {
      type: ClaimSummaryType.HTML,
      data: {
        html: `<p class="govuk-body">${t('PAGES.SUBMIT_CONFIRMATION.RC_PAY_FULL.IF_CLAIMANT_ACCEPTS_CLAIM_WILL_END', {claimantName,lng:lang})}</p>
        <p class="govuk-body">${t('PAGES.SUBMIT_CONFIRMATION.RC_PAY_FULL.IF_CLAIMANT_REJECTS_TRY_MEDIATION', {claimantName,lng:lang})}</p>
        <p class="govuk-body">${t('PAGES.SUBMIT_CONFIRMATION.RC_PAY_FULL.IF_CLAIMANT_REJECTS_COURT_WILL_REVIEW_CASE', { lng: lang })}</p>
        <p class="govuk-body">${t('PAGES.SUBMIT_CONFIRMATION.WE_CONTACT_YOU_FOR_WHAT_TO_DO_NEXT', { lng: lang })}</p>`,
        variables: {claimantName: claimantName},
      },
    },
  ];
}
