import {t} from 'i18next';

import {Claim} from '../../../../../common/models/claim';
import {ClaimSummarySection, ClaimSummaryType} from '../../../../../common/form/models/claimSummarySection';

export function getPA_AlreadyPaidStatus(claim: Claim, lang: string): ClaimSummarySection[] {
  const claimantName = claim.getClaimantName();
  const amount = claim.partialAdmissionPaidAmount();
  return [
    {
      type: ClaimSummaryType.PARAGRAPH,
      data: {
        text: t('PAGES.SUBMIT_CONFIRMATION.PA_ALREADY_PAID.WE_EMAILED_CLAIMANT_YOUR_INTENTION', {lng: lang}),
        variables: {claimantName: claimantName,amount:amount},
      },
    },
  ];
}

export function getPA_AlreadyPaidNextSteps(claim: Claim,lang: string): ClaimSummarySection[]{
  const claimantName = claim.getClaimantName();
  return [
    {
      type: ClaimSummaryType.HTML,
      data: {
        html: `<h3 class="govuk-heading-s govuk-!-margin-bottom-1">${t('PAGES.SUBMIT_CONFIRMATION.IF_CLAIMANT_ACCEPTS_RESPONSE', {claimantName,lng: lang})}</h3>
        <p class="govuk-body">${t('PAGES.SUBMIT_CONFIRMATION.THE_CLAIM_WILL_BE_SETTLED', { lng: lang })}</p>
        <h3 class="govuk-heading-s govuk-!-margin-bottom-1">${t('PAGES.SUBMIT_CONFIRMATION.IF_CLAIMANT_REJECTS_RESPONSE', { claimantName, lng: lang })}</h3>
        <p class="govuk-body">${t('PAGES.SUBMIT_CONFIRMATION.PA_ALREADY_PAID.WE_ASK_CLAIMANT_FOR_MEDIATION', { lng: lang })}</p>
        <p class="govuk-body">${t('PAGES.SUBMIT_CONFIRMATION.PA_ALREADY_PAID.CLAIMANT_REFUSE_MEDIATION', { lng: lang })}</p>
        <p class="govuk-body">${t('PAGES.SUBMIT_CONFIRMATION.WE_CONTACT_YOU_FOR_WHAT_TO_DO_NEXT', { lng: lang })}</p>`,
      },
    },
  ];
}
