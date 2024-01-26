import {Claim} from 'common/models/claim';
import {ClaimSummarySection, ClaimSummaryType} from 'common/form/models/claimSummarySection';
import {formatDateToFullDate} from 'common/utils/dateUtils';
import {t} from 'i18next';

const getResponseStatement = (claim: Claim, lang: string) => {
  const defendantName = claim.getDefendantFullName();
  const paymentDate = claim.fullAdmission.paymentIntention.paymentDate;
  return [
    {
      type: ClaimSummaryType.PARAGRAPH,
      data: {
        text: t('PAGES.REVIEW_DEFENDANTS_RESPONSE.FULL_ADMISSION', {lng: lang}),
        variables: {defendant: defendantName},
      },
    },
    {
      type: ClaimSummaryType.PARAGRAPH,
      data: {
        text: t('PAGES.REVIEW_DEFENDANTS_RESPONSE.TOTAL_PAID_AMOUNT', {lng: lang}),
      },
    },
    {
      type: ClaimSummaryType.PARAGRAPH,
      data: {
        text: t('PAGES.REVIEW_DEFENDANTS_RESPONSE.PAYMENT_DATE', {lng: lang}),
        variables: {paymentDate: formatDateToFullDate(paymentDate, lang)},
      },
    },
  ];
};

export const getReasonForNotPayingFullAmount = (claim: Claim, lang: string): ClaimSummarySection[] => {
  if (claim.isBusiness()) {
    return [];
  }
  return [
    {
      type: ClaimSummaryType.SUBTITLE,
      data: {
        text: t('PAGES.REVIEW_DEFENDANTS_RESPONSE.UNABLE_TO_PAY_FULL_AMOUNT', {lng: lang}),
      },
    },
    {
      type: ClaimSummaryType.PARAGRAPH,
      data: {
        text: claim.getExplanationText(),
      },
    },
  ];
};

export const buildFullAdmissionResponseContent = (claim: Claim, lng: string): ClaimSummarySection[] => {
  return [
    ...getResponseStatement(claim, lng),
    ...getReasonForNotPayingFullAmount(claim, lng),
  ];
};
