import {t} from 'i18next';
import {Claim} from '../../../../../common/models/claim';
import {ClaimSummarySection, ClaimSummaryType} from '../../../../../common/form/models/claimSummarySection';
import {CITIZEN_CONTACT_THEM_URL} from '../../../../../routes/urls';
import {formatDateToFullDate} from '../../../../../common/utils/dateUtils';
import {addDaysToDate} from '../../../../../common/utils/dateUtils';
import { isDecimal } from 'common/utils/numberConverter';
import {isDefendantRejectedMediationOrFastTrackClaim} from 'services/features/response/submitConfirmation/submitConfirmationService';

export function getPA_AlreadyPaidStatus(claim: Claim, lang: string): ClaimSummarySection[] {
  const claimantName = claim.getClaimantFullName();
  const amount = claim.partialAdmissionPaidAmount();
  const formatAmount = isDecimal(amount) ? amount.toFixed(2) : amount;
  return [
    {
      type: ClaimSummaryType.PARAGRAPH,
      data: {
        text: t('PAGES.SUBMIT_CONFIRMATION.PA_ALREADY_PAID.WE_EMAILED_CLAIMANT_YOUR_INTENTION', {lng: lang}),
        variables: { claimantName: claimantName, amount: formatAmount },
      },
    },
  ];
}

export function getPA_AlreadyPaidNextSteps(claim: Claim, lang: string): ClaimSummarySection[] {
  const claimantName = claim.getClaimantFullName();
  const isDefendantRejectedMediationOrIsFastTrackClaim = isDefendantRejectedMediationOrFastTrackClaim(claim);
  return [
    {
      type: ClaimSummaryType.HTML,
      data: {
        html: `<h3 class="govuk-heading-s govuk-!-margin-bottom-1">${t('PAGES.SUBMIT_CONFIRMATION.IF_CLAIMANT_ACCEPTS_RESPONSE', {
          claimantName,
          lng: lang,
        })}</h3>
        <p class="govuk-body">${t('PAGES.SUBMIT_CONFIRMATION.THE_CLAIM_WILL_BE_SETTLED', {lng: lang})}</p>
        <h3 class="govuk-heading-s govuk-!-margin-bottom-1">${t('PAGES.SUBMIT_CONFIRMATION.IF_CLAIMANT_REJECTS_RESPONSE', {
    claimantName,
    lng: lang,
  })}</h3>`,
      },
    },
    {...getParagraphAskMediation(lang, isDefendantRejectedMediationOrIsFastTrackClaim)},
    {...getParagraphDontWantMediationForPAPaid(lang, isDefendantRejectedMediationOrIsFastTrackClaim)},
    {
      type: ClaimSummaryType.PARAGRAPH,
      data: {
        text: t('PAGES.SUBMIT_CONFIRMATION.WE_CONTACT_YOU_FOR_WHAT_TO_DO_NEXT', {lng: lang}),
      },
    },
  ];
}

const getSubtitleIfClaimantRejectOwe = (claimantName: string, partialAmount: string, lang: string) => {
  return {
    type: ClaimSummaryType.SUBTITLE,
    data: {
      text: t('PAGES.SUBMIT_CONFIRMATION.IF_CLAIMANT_REJECTS_OWE', {claimantName, partialAmount, lng: lang}),
    },
  };
};

const getParagraphAskMediation = (lang: string, isDefendantRejectedMediationOrIsFastTrackClaim?: boolean) => {
  if (isDefendantRejectedMediationOrIsFastTrackClaim) {
    return undefined;
  }
  return {
    type: ClaimSummaryType.PARAGRAPH,
    data: {
      text: t('PAGES.SUBMIT_CONFIRMATION.WE_WILL_ASK_MEDIATION', {lng: lang}),
    },
  };
};

const getParagraphDontWantMediation = (claimAmount: number, partialAmount: string, lang: string, isDefendantRejectedMediationOrIsFastTrackClaim?: boolean) => {
  const textContent = isDefendantRejectedMediationOrIsFastTrackClaim ? 'PAGES.SUBMIT_CONFIRMATION.THE_COURT_WILL_REVIEW_CASE' : 'PAGES.SUBMIT_CONFIRMATION.IF_DONT_WANT_MEDIATION';
  return {
    type: ClaimSummaryType.PARAGRAPH,
    data: {
      text: t(textContent, {claimAmount, partialAmount, lng: lang}),
    },
  };
};

const getParagraphDontWantMediationForPAPaid = (lang: string, isDefendantRejectedMediationOrIsFastTrackClaim?: boolean) => {
  const textContent = isDefendantRejectedMediationOrIsFastTrackClaim ? 'PAGES.SUBMIT_CONFIRMATION.THE_COURT_WILL_REVIEW_CASE_HEARING' : 'PAGES.SUBMIT_CONFIRMATION.PA_ALREADY_PAID.CLAIMANT_REFUSE_MEDIATION';
  return {
    type: ClaimSummaryType.PARAGRAPH,
    data: {
      text: t(textContent, {lng: lang}),
    },
  };
};

const getParagraphCourtDecideHowToPay = (lang: string) => {
  return {
    type: ClaimSummaryType.PARAGRAPH,
    data: {
      text: t('PAGES.SUBMIT_CONFIRMATION.COURT_DECIDE_HOW_TO_PAY', {lng: lang}),
    },
  };
};

const getSubtitleIfClaimantAccepstOffer = (claimantName: string, lang: string) => {
  return {
    type: ClaimSummaryType.SUBTITLE,
    data: {
      text: t('PAGES.SUBMIT_CONFIRMATION.IF_CLAIMANT_ACCEPTS_OFFER', {claimantName, lng: lang}),
    },
  };
};

export const getPAPayImmediatelyStatus = (claim: Claim, lang: string): ClaimSummarySection[] => {
  const claimantName = claim.getClaimantFullName();
  const partialAmount = claim.partialAdmission?.howMuchDoYouOwe?.amount?.toFixed(2);
  return [
    {
      type: ClaimSummaryType.PARAGRAPH,
      data: {
        text: t('PAGES.SUBMIT_CONFIRMATION.PA_PAY_IMMEDIATELY.YOU_HAVE_SAID_YOU_OWW', {
          claimantName,
          partialAmount,
          lng: lang,
        }),
      },
    },
  ];
};

export const getPAPayByDateStatus = (claim: Claim, lang: string): ClaimSummarySection[] => {
  const claimantName = claim.getClaimantFullName();
  const partialAmount = claim.partialAdmission?.howMuchDoYouOwe?.amount?.toFixed(2);
  const paymentDate = formatDateToFullDate(claim.partialAdmission?.paymentIntention?.paymentDate, lang);

  return [
    {
      type: ClaimSummaryType.PARAGRAPH,
      data: {
        text: t('PAGES.SUBMIT_CONFIRMATION.PA_PAY_BY_DATE.YOU_BELIEVE_YOU_OWE', {
          claimantName,
          partialAmount,
          paymentDate,
          lng: lang,
        }),
      },
    },
    {
      type: ClaimSummaryType.PARAGRAPH,
      data: {
        text: t('PAGES.SUBMIT_CONFIRMATION.PA_PAY_BY_DATE.SENT_EXPLANATION', {lng: lang}),
      },
    },
  ];
};

export const getPAPayInstallmentsStatus = (claim: Claim, lang: string): ClaimSummarySection[] => {
  const claimantName = claim.getClaimantFullName();
  const partialAmount = claim.partialAdmission?.howMuchDoYouOwe?.amount?.toFixed(2);

  return [
    {
      type: ClaimSummaryType.PARAGRAPH,
      data: {
        text: t('PAGES.SUBMIT_CONFIRMATION.PA_PAY_INSTALLMENTS.YOU_BELIEVE_YOU_OWE', {
          claimantName,
          partialAmount,
          lng: lang,
        }),
      },
    },
    {
      type: ClaimSummaryType.PARAGRAPH,
      data: {
        text: t('PAGES.SUBMIT_CONFIRMATION.PA_PAY_INSTALLMENTS.WE_SENT_EXPLANATION', {lng: lang}),
      },
    },
  ];
};

export const getPAPayInstallmentsNextSteps = (claimId: string, claim: Claim, lang: string): ClaimSummarySection[] => {
  const claimantName = claim.getClaimantFullName();
  const partialAmount = claim.partialAdmission?.howMuchDoYouOwe?.amount?.toFixed(2);
  const claimAmount = claim.totalClaimAmount;
  const isDefendantRejectedMediationOrIsFastTrackClaim = isDefendantRejectedMediationOrFastTrackClaim(claim);

  return [
    {...getSubtitleIfClaimantAccepstOffer(claimantName, lang)},
    {
      type: ClaimSummaryType.HTML,
      data: {
        html: `<p class="govuk-body">${t('PAGES.SUBMIT_CONFIRMATION.YOU_SHOULD', {lng: lang})}</p>
        <ul class="govuk-list govuk-list--bullet">
          <li>${t('PAGES.SUBMIT_CONFIRMATION.SETUP_REPAYMENT_PLAN', {lng: lang})}</li>
          <li>
            <p class="govuk-body govuk-!-margin-bottom-1">
            <a href="${CITIZEN_CONTACT_THEM_URL.replace(':id', claimId)}">${t('PAGES.SUBMIT_CONFIRMATION.CONTACT_CLAIMANT', {
  claimantName,
  lng: lang,
})}</a>
            ${t('PAGES.SUBMIT_CONFIRMATION.IF_NEED_PAYMENT_DETAILS', {lng: lang})}</p>
          </li>
          <li>${t('PAGES.SUBMIT_CONFIRMATION.RECEIPT_FOR_PAYMENTS', {lng: lang})}</li>
        </ul>
        <p class="govuk-body">${t('PAGES.SUBMIT_CONFIRMATION.YOU_WONT_PAY_IMMEDIATELY', {
    claimantName,
    lng: lang,
  })} ${t('PAGES.SUBMIT_CONFIRMATION.REQUEST_COURT_AGAINST_YOU', {partialAmount, lng: lang})}
        </p>`,
      },
    },
    {...getSubtitleIfClaimantRejectOwe(claimantName, partialAmount, lang)},
    {...getParagraphAskMediation(lang, isDefendantRejectedMediationOrIsFastTrackClaim)},
    {...getParagraphDontWantMediation(claimAmount, partialAmount, lang, isDefendantRejectedMediationOrIsFastTrackClaim)},
    {
      type: ClaimSummaryType.SUBTITLE,
      data: {
        text: t('PAGES.SUBMIT_CONFIRMATION.PA_PAY_INSTALLMENTS.REJECT_OFFER_TO_PAY_BY', {claimantName, lng: lang}),
      },
    },
    {...getParagraphCourtDecideHowToPay(lang)},
  ];
};

export const getPAPayByDateNextSteps = (claimId: string, claim: Claim, lang: string): ClaimSummarySection[] => {
  const claimantName = claim.getClaimantFullName();
  const partialAmount = claim.partialAdmission?.howMuchDoYouOwe?.amount?.toFixed(2);
  const paymentDate = formatDateToFullDate(claim.partialAdmission?.paymentIntention?.paymentDate, lang);
  const claimAmount = claim.totalClaimAmount;
  const isDefendantRejectedMediationOrIsFastTrackClaim = isDefendantRejectedMediationOrFastTrackClaim(claim);

  return [
    {...getSubtitleIfClaimantAccepstOffer(claimantName, lang)},
    {
      type: ClaimSummaryType.HTML,
      data: {
        html: `<p class="govuk-body">${t('PAGES.SUBMIT_CONFIRMATION.YOU_SHOULD', {lng: lang})}</p>
        <ul class="govuk-list govuk-list--bullet">
          <li>${t('PAGES.SUBMIT_CONFIRMATION.PA_PAY_BY_DATE.PAY_BY', {claimantName, paymentDate, lng: lang})}</li>
          <li>${t('PAGES.SUBMIT_CONFIRMATION.PA_PAY_BY_DATE.CHEQUES_OR_BANK_TRANSFERS', {lng: lang})}</li>
          <li>
            <p class="govuk-body govuk-!-margin-bottom-1">
            <a href="${CITIZEN_CONTACT_THEM_URL.replace(':id', claimId)}">${t('PAGES.SUBMIT_CONFIRMATION.PA_PAY_BY_DATE.CONTACT_THEM', {lng: lang})}</a>
            ${t('PAGES.SUBMIT_CONFIRMATION.IF_NEED_PAYMENT_DETAILS', {lng: lang})}</p>
          </li>
          <li>${t('PAGES.SUBMIT_CONFIRMATION.PA_PAY_BY_DATE.MAKE_SURE_GET_RECEIPT', {lng: lang})}</li>
        </ul>
        <p class="govuk-body">${t('PAGES.SUBMIT_CONFIRMATION.BECAUSE_YOU_WONT_PAY_IMMEDIATELY', {
    claimantName,
    lng: lang,
  })}</p>
        <ul class="govuk-list govuk-list--bullet">
          <li>${t('PAGES.SUBMIT_CONFIRMATION.ASK_SIGN_SETTLEMENT', {lng: lang})}</li>
          <li>${t('PAGES.SUBMIT_CONFIRMATION.REQUEST_COURT_AGAINST_YOU', {partialAmount, lng: lang})}</li>
        </ul>`,
      },
    },
    {...getSubtitleIfClaimantRejectOwe(claimantName, partialAmount, lang)},
    {...getParagraphAskMediation(lang, isDefendantRejectedMediationOrIsFastTrackClaim)},
    {...getParagraphDontWantMediation(claimAmount, partialAmount, lang, isDefendantRejectedMediationOrIsFastTrackClaim)},
    {
      type: ClaimSummaryType.SUBTITLE,
      data: {
        text: t('PAGES.SUBMIT_CONFIRMATION.PA_PAY_BY_DATE.REJECT_OFFER_TO_PAY_BY', {
          claimantName,
          paymentDate,
          lng: lang,
        }),
      },
    },
    {...getParagraphCourtDecideHowToPay(lang)},
  ];
};

export const getPAPayImmediatelyNextSteps = (claimId: string, claim: Claim, lang: string): ClaimSummarySection[] => {

  const claimantName = claim.getClaimantFullName();
  const claimAmount = claim.totalClaimAmount;
  const paymentDeadLine = addDaysToDate(claim?.respondent1ResponseDate, 5);
  const paymentDate = formatDateToFullDate(paymentDeadLine, lang);
  const partialAmount = claim.partialAdmission?.howMuchDoYouOwe?.amount?.toFixed(2);
  const isDefendantRejectedMediationOrIsFastTrackClaim = isDefendantRejectedMediationOrFastTrackClaim(claim);

  return [
    {
      type: ClaimSummaryType.PARAGRAPH,
      data: {
        text: t('PAGES.SUBMIT_CONFIRMATION.PA_PAY_IMMEDIATELY.YOU_NEED_PAY_IMMEDIATELY', {
          claimantName,
          partialAmount,
          lng: lang,
        }),
      },
    },
    {
      type: ClaimSummaryType.HTML,
      data: {
        html: `<p class="govuk-body">${t('PAGES.SUBMIT_CONFIRMATION.PA_PAY_IMMEDIATELY.MAKE_SURE_THAT', {lng: lang})}</p>
        <ul class="govuk-list govuk-list--bullet">
          <li>${t('PAGES.SUBMIT_CONFIRMATION.PA_PAY_IMMEDIATELY.THEY_GET_MONEY_BY', {paymentDate, lng: lang})}</li>
          <li>${t('PAGES.SUBMIT_CONFIRMATION.PA_PAY_IMMEDIATELY.CHEQUES_OR_BANK_TRANSFERS', {lng: lang})}</li>
          <li>${t('PAGES.SUBMIT_CONFIRMATION.PA_PAY_IMMEDIATELY.RECEIPT_FOR_PAYMENTS', {lng: lang})}</li>
        </ul>`,
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
    {
      type: ClaimSummaryType.SUBTITLE,
      data: {
        text: `${t('PAGES.SUBMIT_CONFIRMATION.PA_PAY_IMMEDIATELY.IF_CLAIMANT_ACCEPTS_OFFER_OF', {
          claimantName,
          partialAmount,
          lng: lang,
        })}`,
      },
    },
    {
      type: ClaimSummaryType.PARAGRAPH,
      data: {
        text: t('PAGES.SUBMIT_CONFIRMATION.PA_PAY_IMMEDIATELY.CLAIM_SETTLED', {lng: lang}),
      },
    },
    {
      type: ClaimSummaryType.SUBTITLE,
      data: {
        text: `${t('PAGES.SUBMIT_CONFIRMATION.IF_CLAIMANT_REJECTS_OFFER', {claimantName, lng: lang})}`,
      },
    },
    {...getParagraphAskMediation(lang, isDefendantRejectedMediationOrIsFastTrackClaim)},
    {...getParagraphDontWantMediation(claimAmount, partialAmount, lang, isDefendantRejectedMediationOrIsFastTrackClaim)},
  ];
};
