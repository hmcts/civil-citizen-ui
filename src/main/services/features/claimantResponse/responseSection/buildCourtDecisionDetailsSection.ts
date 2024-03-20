import { Claim } from 'common/models/claim';
import { ClaimantResponse } from 'common/models/claimantResponse';
import { SummaryRow, summaryRow } from 'common/models/summaryList/summaryList';
import { SummarySection, summarySection } from 'common/models/summaryList/summarySections';
import { formatDateToFullDate } from 'common/utils/dateUtils';
import { getAmount, getFinalPaymentDate, getFirstRepaymentDate, getPaymentAmount, getPaymentDate, getRepaymentFrequency } from 'common/utils/repaymentUtils';
import { t } from 'i18next';

const buildSummaryCourtDecisionByInstallments = (claim: Claim, lng: string): SummaryRow[] => {
  const fullName = claim.getDefendantFullName();
  const amount = getAmount(claim);
  const instalmentAmount = getPaymentAmount(claim);
  const frequency = t(`COMMON.PAYMENT_FREQUENCY.${getRepaymentFrequency(claim)}`, { lng })?.toLowerCase();
  const instalmentDate = formatDateToFullDate(getFirstRepaymentDate(claim), lng);
  return [

    summaryRow(t('PAGES.CHECK_YOUR_ANSWER.COURT_REPAYMENT_PLAN', { lng }), t('PAGES.CHECK_YOUR_ANSWER.WILL_REPAY_IN_INSTALLMENTS', { lng, fullName, amount, instalmentAmount, instalmentDate, frequency })),
    summaryRow(t('PAGES.CHECK_YOUR_ANSWER.COMPLETION_DATE_CYA', { lng }), `${formatDateToFullDate(getFinalPaymentDate(claim), lng)}`),
  ];
};

const buildSummaryCourtDecisionBySetDate = (claim: Claim, lng: string) => {
  const paymentDate = formatDateToFullDate(getPaymentDate(claim), lng);
  return [
    summaryRow(t('PAGES.CHECK_YOUR_ANSWER.COURT_REPAYMENT_PLAN', { lng }), t('PAGES.CHECK_YOUR_ANSWER.REPAYMENT_IN_FULL', { lng, paymentDate })),
    summaryRow(t('PAGES.CHECK_YOUR_ANSWER.COMPLETION_DATE_CYA', { lng }), `${paymentDate}`),
  ];
};

const buildSummaryCourtDecisionStatement = (lng: string) => {
  return summaryRow(t('PAGES.CHECK_YOUR_ANSWER.COURT_DECISION_ROW', { lng }), t('PAGES.CHECK_YOUR_ANSWER.COURT_REJECTED_YOUR_REPAYMENT_PLAN', { lng }));
};

export const buildSummaryForCourtDecisionDetails = (claim: Claim, lng: string): SummarySection => {
  const claimantResponse = Object.assign(new ClaimantResponse(), claim.claimantResponse);
  const courtDecision = summarySection({
    title: t('PAGES.CHECK_YOUR_ANSWER.COURT_DECISION_SECTION', { lng }),
    summaryRows: [],
  });
  const isPayByInstallment = claimantResponse.isCourtDecisionInFavourOfDefendant && (claim.isPAPaymentOptionInstallments() || claim.isFAPaymentOptionInstallments());
  const isPayBySetDate = claimantResponse.isCourtDecisionInFavourOfDefendant && (claim.isPAPaymentOptionByDate() || claim.isFAPaymentOptionBySetDate());
  if (isPayByInstallment) {
    courtDecision.summaryList.rows.push(buildSummaryCourtDecisionStatement(lng));
    courtDecision.summaryList.rows.push(...buildSummaryCourtDecisionByInstallments(claim, lng));
  }

  if (isPayBySetDate) {
    courtDecision.summaryList.rows.push(buildSummaryCourtDecisionStatement(lng));
    courtDecision.summaryList.rows.push(...buildSummaryCourtDecisionBySetDate(claim, lng));
  }

  if (isPayByInstallment || isPayBySetDate) return courtDecision;
};
