import { t } from 'i18next';
import { Claim } from '../../../../../common/models/claim';
import { ClaimSummarySection, ClaimSummaryType } from '../../../../../common/form/models/claimSummarySection';
import { CITIZEN_CONTACT_THEM_URL } from '../../../../../routes/urls';
import { formatDateToFullDate } from '../../../../../common/utils/dateUtils';

export const getPAPayImmediatelyStatus = (claim: Claim, lang: string): ClaimSummarySection[] => {
  const claimantName = claim.getClaimantName();
  const partialAmount = claim.partialAdmission?.howMuchDoYouOwe?.amount;
  return [
    {
      type: ClaimSummaryType.PARAGRAPH,
      data: {
        text: t('PAGES.SUBMIT_CONFIRMATION.PA_PAY_IMMEDIATELY.YOU_HAVE_SAID_YOU_OWW', { claimantName, partialAmount, lng: lang })
      },
    }
  ];
}

export const getPAPayByDateStatus = (claim: Claim, lang: string): ClaimSummarySection[] => {
  const claimantName = claim.getClaimantName();
  const partialAmount = claim.partialAdmission?.howMuchDoYouOwe?.amount;
  // TODO : submission day + 5 days
  const today = new Date();
  today.setDate(today.getDate() + 5);
  const paymentDate = formatDateToFullDate(today, lang);

  return [
    {
      type: ClaimSummaryType.PARAGRAPH,
      data: {
        text: t('PAGES.SUBMIT_CONFIRMATION.PA_PAY_BY_DATE.YOU_BELIEVE_YOU_OWE', { claimantName, partialAmount, paymentDate, lng: lang })
      },
    },
    {
      type: ClaimSummaryType.PARAGRAPH,
      data: {
        text: t('PAGES.SUBMIT_CONFIRMATION.PA_PAY_BY_DATE.SENT_EXPLANATION', { lng: lang })
      },
    },
  ];
}

export const getPAPayByDateNextSteps = (claimId: string, claim: Claim, lang: string): ClaimSummarySection[] => {
  const claimantName = claim.getClaimantName();
  const partialAmount = claim.partialAdmission?.howMuchDoYouOwe?.amount;
  // TODO : submission day + 5 days
  const today = new Date();
  today.setDate(today.getDate() + 5);
  const paymentDate = formatDateToFullDate(today, lang);
  const claimAmount = claim.totalClaimAmount;

  // "PA_PAY_BY_DATE": {
  //   "YOU_BELIEVE_YOU_OWE": "You believe you owe £{{ partialAmount }}. We’ve emailed {{ claimantName }} your offer to pay this amount by {{ paymentDate }}",
  //   "SENT_EXPLANATION": "We’ve also sent them your explanation of why you don’t believe you owe the amount claimed.",
  //   "WE_WILL_CONTACT_YOU": "We’ll contact you when they respond.",
  //   "YOU_SHOULD": "You should:",
  //   "PAY_BY": "pay {{ claimantName }} by {{ paymentDate }}",
  //   "CHEQUES_OR_BANK_TRANSFERS": "make sure any cheques or bank transfers are clear in their account by the deadline",
  //   "CONTACT_THEMT": "Contact them",
  //   "IF_NEED_PAYMENT_DETAILS": "if you need their payment details.",
  //   "MAKE_SURE_GET_RECEIPT": "make sure you get a receipt for your payment",
  //   "BECAUSE_YOU_WONT_PAY_IMMEDIATELY": "Because you’ve said you won’t pay immediately, {{ claimantName }} can either:",
  //   "ASK_SIGN_SETTLEMENT": "ask you to sign a settlement agreement to formalise the repayment plan",
  //   "REQUEST_COURT_AGAINSt_YOU": "request a County Court Judgment against you for £{{ claimAmount }}",
  //   "IF_CLAIMANT_REJECTS": "If {{ claimantName }} rejects that you only owe £{{ partialAmount }}",
  //   "WE_WILL_ASK_MEDIATION": "We’ll ask if they want to try mediation. If they agree, we’ll contact you to try to arrange an appointment.",
  //   "IF_DONT_WANT_MEDIATION": "If they don’t want to try mediation the court will review the case for the full amount of £{{ claimAmount }}.",
  //   "REJECT_OFFER_TO_PAY_BY": "If {{ claimantName }} rejects your offer to pay by {{ paymentDate }}",
  //   "COURT_WILL_DECIDE": "The court will decide how you must pay."
  // },

  return [
    {
      type: ClaimSummaryType.SUBTITLE,
      data: {
        text: t('PAGES.SUBMIT_CONFIRMATION.IF_CLAIMANT_ACCEPTS_OFFER', { claimantName, lng: lang })
      },
    },
    {
      type: ClaimSummaryType.HTML,
      data: {
        html: `<p class="govuk-body">${t('PAGES.SUBMIT_CONFIRMATION.PA_PAY_BY_DATE.YOU_SHOULD', { lng: lang })}</p>
        <ul class="govuk-list govuk-list--bullet">
          <li>${t('PAGES.SUBMIT_CONFIRMATION.PA_PAY_BY_DATE.PAY_BY', { claimantName, paymentDate, lng: lang })}</li>
          <li>${t('PAGES.SUBMIT_CONFIRMATION.PA_PAY_BY_DATE.CHEQUES_OR_BANK_TRANSFERS', { lng: lang })}</li>
          <li>
            <p class="govuk-body govuk-!-margin-bottom-1">
            <a href="${CITIZEN_CONTACT_THEM_URL.replace(':id', claimId)}">${t('PAGES.SUBMIT_CONFIRMATION.PA_PAY_BY_DATE.CONTACT_THEMT', { lng: lang })}</a>
            ${t('PAGES.SUBMIT_CONFIRMATION.PA_PAY_BY_DATE.IF_NEED_PAYMENT_DETAILS', { lng: lang })}</p>
          </li>
          <li>${t('PAGES.SUBMIT_CONFIRMATION.PA_PAY_BY_DATE.MAKE_SURE_GET_RECEIPT', { lng: lang })}</li>
        </ul>
        <p class="govuk-body">${t('PAGES.SUBMIT_CONFIRMATION.PA_PAY_BY_DATE.BECAUSE_YOU_WONT_PAY_IMMEDIATELY', { lng: lang })}</p>
        <ul class="govuk-list govuk-list--bullet">
          <li>${t('PAGES.SUBMIT_CONFIRMATION.PA_PAY_BY_DATE.ASK_SIGN_SETTLEMENT', { lng: lang })}</li>
          <li>${t('PAGES.SUBMIT_CONFIRMATION.PA_PAY_BY_DATE.REQUEST_COURT_AGAINST_YOU', { partialAmount, lng: lang })}</li>
        </ul>`,
      },
    },
    {
      type: ClaimSummaryType.SUBTITLE,
      data: {
        text: t('PAGES.SUBMIT_CONFIRMATION.PA_PAY_BY_DATE.IF_CLAIMANT_REJECTS', { claimantName, partialAmount, lng: lang })
      },
    },
    {
      type: ClaimSummaryType.PARAGRAPH,
      data: {
        text: t('PAGES.SUBMIT_CONFIRMATION.PA_PAY_BY_DATE.WE_WILL_ASK_MEDIATION', { lng: lang })
      },
    },
    {
      type: ClaimSummaryType.PARAGRAPH,
      data: {
        text: t('PAGES.SUBMIT_CONFIRMATION.PA_PAY_BY_DATE.IF_DONT_WANT_MEDIATION', { claimAmount, partialAmount, lng: lang })
      },
    },
    {
      type: ClaimSummaryType.SUBTITLE,
      data: {
        text: t('PAGES.SUBMIT_CONFIRMATION.PA_PAY_BY_DATE.REJECT_OFFER_TO_PAY_BY', { claimantName, paymentDate, lng: lang })
      },
    },
    {
      type: ClaimSummaryType.PARAGRAPH,
      data: {
        text: t('PAGES.SUBMIT_CONFIRMATION.PA_PAY_BY_DATE.COURT_WILL_DECIDE', { lng: lang })
      },
    },
  ];
}

export const getPAPayImmediatelyNextSteps = (claimId: string, claim: Claim, lang: string): ClaimSummarySection[] => {

  const claimantName = claim.getClaimantName();
  const claimAmount = claim.totalClaimAmount;
  // TODO : submission day + 5 days
  const today = new Date();
  today.setDate(today.getDate() + 5);
  const paymentDate = formatDateToFullDate(today, lang);
  const partialAmount = claim.partialAdmission?.howMuchDoYouOwe?.amount;

  return [
    {
      type: ClaimSummaryType.PARAGRAPH,
      data: {
        text: t('PAGES.SUBMIT_CONFIRMATION.PA_PAY_IMMEDIATELY.YOU_NEED_PAY_IMMEDIATELY', { claimantName, partialAmount, lng: lang }),
      },
    },
    {
      type: ClaimSummaryType.HTML,
      data: {
        html: `<p class="govuk-body">${t('PAGES.SUBMIT_CONFIRMATION.PA_PAY_IMMEDIATELY.MAKE_SURE_THAT', { lng: lang })}</p>
        <ul class="govuk-list govuk-list--bullet">
          <li>${t('PAGES.SUBMIT_CONFIRMATION.PA_PAY_IMMEDIATELY.THEY_GET_MONEY_BY', { paymentDate, lng: lang })}</li>
          <li>${t('PAGES.SUBMIT_CONFIRMATION.PA_PAY_IMMEDIATELY.CHEQUES_OR_BANK_TRANSFERS', { lng: lang })}</li>
          <li>${t('PAGES.SUBMIT_CONFIRMATION.PA_PAY_IMMEDIATELY.RECEIPT_FOR_PAYMENTS', { lng: lang })}</li>
        </ul>`,
      },
    },
    {
      type: ClaimSummaryType.LINK,
      data: {
        text: `${t('PAGES.SUBMIT_CONFIRMATION.PA_PAY_IMMEDIATELY.CONTACT_CLAIMANT', { claimantName, lng: lang })}`,
        textAfter: t('PAGES.SUBMIT_CONFIRMATION.PA_PAY_IMMEDIATELY.IF_NEED_PAYMENT_DETAILS', { lng: lang }),
        href: CITIZEN_CONTACT_THEM_URL.replace(':id', claimId),
      },
    },
    {
      type: ClaimSummaryType.SUBTITLE,
      data: {
        text: `${t('PAGES.SUBMIT_CONFIRMATION.IF_CLAIMANT_ACCEPTS_OFFER', { claimantName, lng: lang })}`,
      },
    },
    {
      type: ClaimSummaryType.PARAGRAPH,
      data: {
        text: t('PAGES.SUBMIT_CONFIRMATION.PA_PAY_IMMEDIATELY.CLAIM_SETTLED', { lng: lang }),
      },
    },
    {
      type: ClaimSummaryType.SUBTITLE,
      data: {
        text: `${t('PAGES.SUBMIT_CONFIRMATION.IF_CLAIMANT_REJECTS_OFFER', { claimantName, lng: lang })}`,
      },
    },
    {
      type: ClaimSummaryType.PARAGRAPH,
      data: {
        text: t('PAGES.SUBMIT_CONFIRMATION.PA_PAY_IMMEDIATELY.WANT_FREE_MEDIATION', { lng: lang }),
      },
    },
    {
      type: ClaimSummaryType.PARAGRAPH,
      data: {
        text: t('PAGES.SUBMIT_CONFIRMATION.PA_PAY_IMMEDIATELY.DONT_WANT_FREE_MEDIATION', { lng: lang, claimAmount }),
      },
    },
  ];
}
