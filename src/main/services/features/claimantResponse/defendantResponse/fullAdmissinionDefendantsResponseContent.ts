import {Claim} from 'common/models/claim';
import {ClaimSummarySection, ClaimSummaryType} from 'common/form/models/claimSummarySection';
import {formatDateToFullDate} from 'common/utils/dateUtils';

const getResponseStatement = (claim: Claim, lang: string) => {
  const defendantName = claim.getDefendantFullName();
  const paymentDate = claim.fullAdmission.paymentIntention.paymentDate;
  return [
    {
      type: ClaimSummaryType.PARAGRAPH,
      data: {
        text: 'PAGES.REVIEW_DEFENDANTS_RESPONSE.FULL_ADMISSION',
        variables: {defendant: defendantName},
      },
    },
    {
      type: ClaimSummaryType.PARAGRAPH,
      data: {
        text: 'PAGES.REVIEW_DEFENDANTS_RESPONSE.TOTAL_PAID_AMOUNT',
      },
    },
    {
      type: ClaimSummaryType.PARAGRAPH,
      data: {
        text: 'PAGES.REVIEW_DEFENDANTS_RESPONSE.PAYMENT_DATE',
        variables: {paymentDate: formatDateToFullDate(paymentDate, lang)},
      },
    },
  ];
};

export const getReasonForNotPayingFullAmount = (claim: Claim): ClaimSummarySection[] => {
  if (claim.isBusiness()) {
    return [];
  }
  return [
    {
      type: ClaimSummaryType.SUBTITLE,
      data: {
        text: 'PAGES.REVIEW_DEFENDANTS_RESPONSE.UNABLE_TO_PAY_FULL_AMOUNT',
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
    ...getReasonForNotPayingFullAmount(claim),
  ];
};
