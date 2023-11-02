import {t} from 'i18next';
import {ClaimSummaryType} from 'common/form/models/claimSummarySection';
import {Claim} from 'common/models/claim';
import {addDaysToDate, formatDateToFullDate} from 'common/utils/dateUtils';

export const getPAPayImmediatelyAcceptedNextSteps = (claim: Claim, lang: string) => {
  const admittedAmount = claim.partialAdmission?.howMuchDoYouOwe?.amount?.toFixed(2);
  const paymentDeadLine = addDaysToDate(claim?.respondent1ResponseDate, 5);
  const paymentDate = formatDateToFullDate(paymentDeadLine, lang);
  return [
    {
      type: ClaimSummaryType.TITLE,
      data: {
        text: t('PAGES.SUBMIT_CONFIRMATION.WHAT_HAPPENS_NEXT', {lng: lang}),
      },
    },
    {
      type: ClaimSummaryType.PARAGRAPH,
      data: {
        text: t('PAGES.CLAIMANT_RESPONSE_CONFIRMATION.PA_PAY_IMMEDIATELY.DEFENDANT_TO_PAY_YOU_IMMEDIATELY', {admittedAmount, lgn: lang}),
      },
    },
    {
      type: ClaimSummaryType.PARAGRAPH,
      data: {
        text: t('PAGES.CLAIMANT_RESPONSE_CONFIRMATION.PA_PAY_IMMEDIATELY.PAYMENT_BY', {paymentDate, lgn: lang}),
      },
    },
    {
      type: ClaimSummaryType.PARAGRAPH,
      data: {
        text: t('PAGES.CLAIMANT_RESPONSE_CONFIRMATION.PA_PAY_IMMEDIATELY.TELL_US_SETTLEMENT', {lgn: lang}),
      },
    },
  ];
};

export const getRejectedResponseNoMediationNextSteps = (lang: string) => {
 
  return [
    {
      type: ClaimSummaryType.TITLE,
      data: {
        text: t('PAGES.SUBMIT_CONFIRMATION.WHAT_HAPPENS_NEXT', {lng: lang}),
      },
    },
    {
      type: ClaimSummaryType.PARAGRAPH,
      data: {
        text: t('PAGES.CLAIMANT_RESPONSE_CONFIRMATION.REJECTED_DEFENDANT_RESPONSE.WHAT_HAPPENS_NEXT_TEXT', {lng: lang}),
      },
    },
  ];
};
