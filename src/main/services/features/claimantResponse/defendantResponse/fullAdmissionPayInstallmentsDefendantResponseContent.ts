import {
  ClaimSummarySection,
  ClaimSummaryType,
} from 'common/form/models/claimSummarySection';
import {constructRepaymentPlanSection} from '../claimantResponseService';
import {Claim} from 'common/models/claim';
import {t} from "i18next";

const getResponseSummaryText = (claim: Claim, lang: string) => {
  const defendantName = claim.getDefendantFullName();
  return [
    {
      type: ClaimSummaryType.PARAGRAPH,
      data: {
        text: t('PAGES.REVIEW_DEFENDANTS_RESPONSE.FULL_ADMISSION_PAY_BY_INSTALLMENTS.DEFENDANT_ADMITS', {lng: lang}),
        variables: { defendant: defendantName },
      },
    },
    {
      type: ClaimSummaryType.PARAGRAPH,
      data: {
        text: t('PAGES.REVIEW_DEFENDANTS_RESPONSE.FULL_ADMISSION_PAY_BY_INSTALLMENTS.THEY_OFFERED_PAY', {lng: lang}),
      },
    },
  ];
};

export const buildFullAdmissionInstallmentsResponseContent = (claim: Claim, lng: string): ClaimSummarySection[] => {
  return [
    ...getResponseSummaryText(claim, lng),
    ...constructRepaymentPlanSection(claim, lng),
  ];
};
