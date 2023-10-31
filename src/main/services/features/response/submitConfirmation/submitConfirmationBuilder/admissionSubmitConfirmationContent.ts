import {t} from 'i18next';
import {Claim} from '../../../../../common/models/claim';
import {ClaimSummarySection, ClaimSummaryType} from '../../../../../common/form/models/claimSummarySection';
import {CITIZEN_CONTACT_THEM_URL} from '../../../../../routes/urls';
import {formatDateToFullDate} from '../../../../../common/utils/dateUtils';

export function getFAPAyImmediatelyStatus(claim: Claim, lang: string): ClaimSummarySection[] {
  const claimantName = claim.getClaimantFullName();
  return [
    {
      type: ClaimSummaryType.PARAGRAPH,
      data: {
        text: t('PAGES.SUBMIT_CONFIRMATION.FA_PAY_IMMEDIATELY.WE_EMAILED_CLAIMANT_YOUR_INTENTION', {lng: lang}),
        variables: {claimantName: claimantName},
      },
    },
  ];
}

export function getFAPayByDateStatus(claim: Claim, lang: string): ClaimSummarySection[] {
  const claimantName = claim.getClaimantFullName();
  const paymentDate = formatDateToFullDate(claim.fullAdmission?.paymentIntention?.paymentDate, lang);
  return [
    {
      type: ClaimSummaryType.PARAGRAPH,
      data: {
        text: t('PAGES.SUBMIT_CONFIRMATION.FA_PAY_BY_DATE.WE_EMAILED_CLAIMANT_YOUR_INTENTION', {lng: lang}),
        variables: {claimantName, paymentDate},
      },
    },
  ];
}

export function getFAPayByInstallmentsStatus(claim: Claim, lang: string): ClaimSummarySection[] {
  const claimantName = claim.getClaimantFullName();
  return [
    {
      type: ClaimSummaryType.PARAGRAPH,
      data: {
        text: t('PAGES.SUBMIT_CONFIRMATION.FA_PAY_BY_INSTALLMENTS.WE_EMAILED_CLAIMANT_YOUR_INTENTION', {lng: lang}),
        variables: {claimantName: claimantName},
      },
    },
  ];
}

export function getContactYouStatement(lang: string): ClaimSummarySection[] {
  return [
    {
      type: ClaimSummaryType.PARAGRAPH,
      data: {
        text: t('PAGES.SUBMIT_CONFIRMATION.WE_CONTACT_YOU', {lng: lang}),
      },
    },
  ];
}

export function getfinancialDetails(claimId: string, claim: Claim, lang: string): ClaimSummarySection[] {
  const claimantName = claim.getClaimantFullName();
  const financialDetails = [
    {
      type: ClaimSummaryType.TITLE,
      data: {
        text: t('PAGES.SUBMIT_CONFIRMATION.SEND_FINANCIAL_DETAILS', {lng: lang}),
      },
    },
    {
      type: ClaimSummaryType.PARAGRAPH,
      data: {
        text: t('PAGES.SUBMIT_CONFIRMATION.SEND_STATEMENT_OF_ACC', {lng: lang}),
        variables: {claimantName: claimantName},
      },
    },
    {
      type: ClaimSummaryType.LINK,
      data: {
        text: `${t('PAGES.SUBMIT_CONFIRMATION.GET_FINANCIAL_DETAILS', {claimantName, lng: lang})}`,
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

export function getNextStepsTitle(lang: string):ClaimSummarySection[] {
  return [
    {
      type: ClaimSummaryType.TITLE,
      data: {
        text: t('PAGES.SUBMIT_CONFIRMATION.WHAT_HAPPENS_NEXT', {lng: lang}),
      },
    },
  ];
}

export function getFAPayImmediatelyNextSteps(claimId: string, claim: Claim, lang: string, respondentPaymentDeadline?: Date): ClaimSummarySection[]{
  const claimantName = claim.getClaimantFullName();
  const immediatePaymentDeadline = formatDateToFullDate(respondentPaymentDeadline, lang);
  return [
    {
      type: ClaimSummaryType.HTML,
      data: {
        html: `<p class="govuk-body">${t('PAGES.SUBMIT_CONFIRMATION.FA_PAY_IMMEDIATELY.MAKE_SURE_THAT', {lng: lang})}:</p><ul class="govuk-list govuk-list--bullet"><li>${t('PAGES.SUBMIT_CONFIRMATION.FA_PAY_IMMEDIATELY.THEY_CAN_REQUEST_CCJ', {paymentDate: immediatePaymentDeadline, lng: lang})}</li><li>${t('PAGES.SUBMIT_CONFIRMATION.FA_PAY_IMMEDIATELY.BANK_TRANSFERS_CLEAR_IN_THEIR_ACC', {lng: lang})}</li><li>${t('PAGES.SUBMIT_CONFIRMATION.FA_PAY_IMMEDIATELY.RECEIPT_FOR_PAYMENTS', {lng: lang})}</li><li>${t('PAGES.SUBMIT_CONFIRMATION.FA_PAY_IMMEDIATELY.THEY_CALL_COURT_FOR_YOU_PAID', {lng: lang})}</li></ul>`,
      },
    },
    {
      type: ClaimSummaryType.LINK,
      data: {
        text: `${t('PAGES.SUBMIT_CONFIRMATION.CONTACT_CLAIMANT', {claimantName, lng: lang})}`,
        textAfter: t('PAGES.SUBMIT_CONFIRMATION.IF_NEED_PAYMENT_DETAILS', {lng: lang}),
        href: CITIZEN_CONTACT_THEM_URL.replace(':id', claimId),
      },
    },
  ];
}

export function getFAPayByDateNextSteps(claimId: string, claim: Claim, lang: string): ClaimSummarySection[] {
  const claimantName = claim.getClaimantFullName();
  const paymentDate = formatDateToFullDate(claim.fullAdmission?.paymentIntention?.paymentDate, lang);
  const contactThemUrl = CITIZEN_CONTACT_THEM_URL.replace(':id', claimId);
  const acceptedOfferContent = [
    {
      type: ClaimSummaryType.SUBTITLE,
      data: {
        text: `${t('PAGES.SUBMIT_CONFIRMATION.IF_CLAIMANT_ACCEPTS_OFFER', {claimantName, lng: lang})}`,
      },
    },
    {
      type: ClaimSummaryType.HTML,
      data: {
        html: `<p class="govuk-body">${t('PAGES.SUBMIT_CONFIRMATION.YOU_SHOULD', {lng: lang})}</p><ul class="govuk-list govuk-list--bullet"><li>${t('PAGES.SUBMIT_CONFIRMATION.FA_PAY_BY_DATE.PAY_CLAIMANT_BY_DATE', {claimantName, paymentDate, lng: lang})}</li><li>${t('PAGES.SUBMIT_CONFIRMATION.FA_PAY_BY_DATE.BANK_TRANSFERS_CLEAR_IN_THEIR_ACC', {lng: lang})}</li><li><a href=${contactThemUrl}>${t('PAGES.SUBMIT_CONFIRMATION.FA_PAY_BY_DATE.CONTACT_THEM', {lng: lang})}</a>${t('PAGES.SUBMIT_CONFIRMATION.IF_NEED_PAYMENT_DETAILS', {lng: lang})}</li><li>${t('PAGES.SUBMIT_CONFIRMATION.FA_PAY_IMMEDIATELY.RECEIPT_FOR_PAYMENTS', {lng: lang})}</li></ul>`,
      },
    },
  ];
  const rejectedOfferContent = getFARejectOfferContent(claim, lang);
  const notPayImmediatelyContent = getNotPayImmediatelyContent(claim, lang);
  return [...acceptedOfferContent, ...notPayImmediatelyContent, ...rejectedOfferContent];
}

export function getFAPayByInstallmentsNextSteps(claimId: string, claim: Claim, lang:string): ClaimSummarySection[] {
  const claimantName = claim.getClaimantFullName();
  const contactThemUrl = CITIZEN_CONTACT_THEM_URL.replace(':id', claimId);
  const acceptedOfferContent = [
    {
      type: ClaimSummaryType.SUBTITLE,
      data: {
        text: `${t('PAGES.SUBMIT_CONFIRMATION.IF_CLAIMANT_ACCEPTS_OFFER', {claimantName, lng: lang})}`,
      },
    },
    {
      type: ClaimSummaryType.HTML,
      data: {
        html: `<p class="govuk-body">${t('PAGES.SUBMIT_CONFIRMATION.YOU_SHOULD', {lng: lang})}</p><ul class="govuk-list govuk-list--bullet"><li>${t('PAGES.SUBMIT_CONFIRMATION.SETUP_REPAYMENT_PLAN', {lng: lang})}</li><li><a href=${contactThemUrl}>${t('PAGES.SUBMIT_CONFIRMATION.FA_PAY_BY_DATE.CONTACT_THEM', {lng: lang})}</a>${t('PAGES.SUBMIT_CONFIRMATION.IF_NEED_PAYMENT_DETAILS', {lng: lang})}</li><li>${t('PAGES.SUBMIT_CONFIRMATION.FA_PAY_IMMEDIATELY.RECEIPT_FOR_PAYMENTS', {lng: lang})}</li></ul>`,
      },
    },
  ];
  const rejectedOfferContent = getFARejectOfferContent(claim, lang);
  const notPayImmediatelyContent = getNotPayImmediatelyContent(claim, lang);
  return [...acceptedOfferContent, ...notPayImmediatelyContent, ...rejectedOfferContent];
}

export function getNotPayImmediatelyContent(claim: Claim, lang: string): ClaimSummarySection[]{
  const claimantName = claim.getClaimantFullName();
  return [
    {
      type: ClaimSummaryType.HTML,
      data: {
        html: `<p class="govuk-body">${t('PAGES.SUBMIT_CONFIRMATION.YOU_WONT_PAY_IMMEDIATELY', {claimantName, lng: lang})}${t('PAGES.SUBMIT_CONFIRMATION.REQUEST_CCJ_AGAINST_YOU', {lng: lang})}</p>`,
        variables: {claimantName: claimantName},
      },
    },
  ];
}

export function getFARejectOfferContent(claim: Claim, lang: string): ClaimSummarySection[] {
  const claimantName = claim.getClaimantFullName();
  return [
    {
      type: ClaimSummaryType.SUBTITLE,
      data: {
        text: `${t('PAGES.SUBMIT_CONFIRMATION.IF_CLAIMANT_REJECTS_OFFER', {claimantName, lng: lang})}`,
      },
    },
    {
      type: ClaimSummaryType.PARAGRAPH,
      data: {
        text: t('PAGES.SUBMIT_CONFIRMATION.COURT_DECIDE_HOW_TO_PAY', {lng: lang}),
        variables: {claimantName: claimantName},
      },
    },
  ];
}
