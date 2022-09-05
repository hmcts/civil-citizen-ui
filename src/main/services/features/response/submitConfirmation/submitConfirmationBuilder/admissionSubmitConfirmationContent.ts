import {t} from 'i18next';

import {Claim} from '../../../../../common/models/claim';
import {ClaimSummarySection, ClaimSummaryType} from '../../../../../common/form/models/claimSummarySection';
import {CITIZEN_CONTACT_THEM_URL} from '../../../../../routes/urls';
import {formatDateToFullDate} from '../../../../../common/utils/dateUtils';

export function getFAPAyImmediatelyStatus(claim: Claim): ClaimSummarySection[] {
  const claimantName = claim.getClaimantName();
  return [
    {
      type: ClaimSummaryType.PARAGRAPH,
      data: {
        text: 'PAGES.SUBMIT_CONFIRMATION.FA_PAY_IMMEDIATELY.WE_EMAILED_CLAIMANT_YOUR_INTENTION',
        variables: {claimantName: claimantName},
      },
    },
  ];
}

export function getFAPayByDateStatus(claim: Claim, lang: string): ClaimSummarySection[] {
  const claimantName = claim.getClaimantName();
  const paymentDate = formatDateToFullDate(claim.paymentDate, lang);
  return [
    {
      type: ClaimSummaryType.PARAGRAPH,
      data: {
        text: 'We’ve emailed {{ claimantName }} your offer to pay by {{ paymentDate }} and your explanation of why you can’t pay before then.',
        variables: {claimantName, paymentDate},
      },
    },
  ];
}

export function getFAPayByInstallmentsStatus(claim: Claim): ClaimSummarySection[] {
  const claimantName = claim.getClaimantName();
  return [
    {
      type: ClaimSummaryType.PARAGRAPH,
      data: {
        text: 'We’ve emailed {{claimantName}} to tell them you’ve suggested paying by instalments.',
        variables: {claimantName: claimantName},
      },
    },
  ];
}

export function getContactYouStatement(claim: Claim): ClaimSummarySection[] {
  const claimantName = claim.getClaimantName();
  return [
    {
      type: ClaimSummaryType.PARAGRAPH,
      data: {
        text: 'We’ll contact you when they respond.',
        variables: {claimantName: claimantName},
      },
    },
  ];
}

export function getfinancialDetails(claimId: string, claim: Claim, lang: string): ClaimSummarySection[] {
  const claimantName = claim.getClaimantName();
  const financialDetails = [
    {
      type: ClaimSummaryType.TITLE,
      data: {
        text: 'Send your financial details',
      },
    },
    {
      type: ClaimSummaryType.PARAGRAPH,
      data: {
        text: 'Send {{ claimantName }} your company or organisation’s most recent statement of accounts, if you haven’t already.',
        variables: {claimantName: claimantName},
      },
    },
    {
      type: ClaimSummaryType.LINK,
      data: {
        text: `${t('Get {{ claimantName }}’s financial details.', {claimantName, lng: lang})}`,
        href: CITIZEN_CONTACT_THEM_URL.replace(':id', claimId),
      },
    },
  ];
  if (claim.isBusiness()) {
    return financialDetails;
  } else {
    return [];
  }
}

export function getNextStepsTitle():ClaimSummarySection[] {
  return [
    {
      type: ClaimSummaryType.TITLE,
      data: {
        text: 'PAGES.SUBMIT_CONFIRMATION.WHAT_HAPPENS_NEXT',
      },
    },
  ]; 
}

export function getFAPayImmediatelyNextSteps(claimId: string, claim: Claim, lang: string): ClaimSummarySection[]{
  const claimantName = claim.getClaimantName();
  // TODO : submission day + 5 days
  const today = new Date();
  today.setDate(today.getDate() + 5);
  const immediatePaymentDeadline = formatDateToFullDate(today, lang);
  return [
    {
      type: ClaimSummaryType.HTML,
      data: {
        html: `<p class="govuk-body">${t('PAGES.SUBMIT_CONFIRMATION.FA_PAY_IMMEDIATELY.MAKE_SURE_THAT', {lng: lang})}:</p><ul class="govuk-list govuk-list--bullet"><li>${t('PAGES.SUBMIT_CONFIRMATION.FA_PAY_IMMEDIATELY.THEY_CAN_REQUEST_CCJ', {paymentDate: immediatePaymentDeadline, lng: lang})}</li><li>${t('PAGES.SUBMIT_CONFIRMATION.FA_PAY_IMMEDIATELY.BANK_TRANSFERS_CLEAR_IN_THEIR_ACC')}</li><li>${t('PAGES.SUBMIT_CONFIRMATION.FA_PAY_IMMEDIATELY.RECEIPT_FOR_PAYMENTS', {lng: lang})}</li><li>${t('PAGES.SUBMIT_CONFIRMATION.FA_PAY_IMMEDIATELY.THEY_CALL_COURT_FOR_YOU_PAID', {lng: lang})}</li></ul>`,
      },
    },
    {
      type: ClaimSummaryType.LINK,
      data: {
        text: `${t('PAGES.SUBMIT_CONFIRMATION.FA_PAY_IMMEDIATELY.CONTACT_CLAIMANT', {claimantName, lng: lang})}`,
        textAfter: 'PAGES.SUBMIT_CONFIRMATION.FA_PAY_IMMEDIATELY.IF_NEED_THEIR_DETAILS',
        href: CITIZEN_CONTACT_THEM_URL.replace(':id', claimId),
      },
    },
  ];
}

export function getFAPayByDateNextSteps(claimId: string, claim: Claim, lang: string): ClaimSummarySection[] {
  const claimantName = claim.getClaimantName();
  const paymentDate = formatDateToFullDate(claim.paymentDate, lang);
  const contactThemUrl = CITIZEN_CONTACT_THEM_URL.replace(':id', claimId);
  const acceptedOfferContent = [
    {
      type: ClaimSummaryType.SUBTITLE,
      data: {
        text: `${t('If {{ claimantName }} accepts your offer', {claimantName, lng: lang})}`,
      },
    },
    {
      type: ClaimSummaryType.HTML,
      data: {
        html: `<p class="govuk-body">You should:</p><ul class="govuk-list govuk-list--bullet"><li>${t('pay {{ claimantName }} by {{ paymentDate }}', {claimantName, paymentDate, lng: lang})}</li><li>make sure any cheques or bank transfers are clear in their account by the deadline</li><li><a href=${contactThemUrl}>Contact them</a> if you need their payment details.</li><li>make sure you get a receipt for your payment</li></ul>`,
      },
    },
  ];
  const rejectedOfferContent = getFARejectOfferContent(claim, lang);
  const notPayImmediatelyContent = getNotPayImmediatelyContent(claim, lang);
  return [...acceptedOfferContent, ...notPayImmediatelyContent, ...rejectedOfferContent];
}

export function getFAPayByInstallmentsNextSteps(claimId: string, claim: Claim, lang:string): ClaimSummarySection[] {
  const claimantName = claim.getClaimantName();
  const contactThemUrl = CITIZEN_CONTACT_THEM_URL.replace(':id', claimId);
  const acceptedOfferContent = [
    {
      type: ClaimSummaryType.SUBTITLE,
      data: {
        text: `${t('If {{ claimantName }} accepts your offer', {claimantName, lng: lang})}`,
      },
    },
    {
      type: ClaimSummaryType.HTML,
      data: {
        html: `<p class="govuk-body">You should:</p><ul class="govuk-list govuk-list--bullet"><li>set up your repayment plan to begin when you said it would</li><li><a href=${contactThemUrl}>Contact them</a> if you need their payment details.</li><li>make sure you get a receipt for each payment</li></ul>`,
      },
    },
  ];
  const rejectedOfferContent = getFARejectOfferContent(claim, lang);
  const notPayImmediatelyContent = getNotPayImmediatelyContent(claim, lang);
  return [...acceptedOfferContent, ...notPayImmediatelyContent, ...rejectedOfferContent];
}

export function getNotPayImmediatelyContent(claim: Claim, lang: string): ClaimSummarySection[]{
  const claimantName = claim.getClaimantName();
  return [
    {
      type: ClaimSummaryType.HTML,
      data: {
        html: `<p class="govuk-body">${t('Because you’ve said you won’t pay immediately, {{ claimantName }} can either', {claimantName, lng: lang})}:</p><ul class="govuk-list govuk-list--bullet"><li>ask you to sign a settlement agreement to formalise the repayment plan</li><li>request a County Court Judgment against you</li></ul>`,
        variables: {claimantName: claimantName},
      },
    },
  ];
} 

export function getFARejectOfferContent(claim: Claim, lang: string): ClaimSummarySection[] {
  const claimantName = claim.getClaimantName();
  return [
    {
      type: ClaimSummaryType.SUBTITLE,
      data: {
        text: `${t('If {{claimantName}} rejects your offer', {claimantName, lng: lang})}`,
      },
    },
    {
      type: ClaimSummaryType.PARAGRAPH,
      data: {
        text: 'The court will decide how you must pay.',
        variables: {claimantName: claimantName},
      },
    },
  ];
} 
