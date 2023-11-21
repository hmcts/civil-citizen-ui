import { Claim } from 'common/models/claim';
import { ClaimantResponse } from 'common/models/claimantResponse';
import { SummaryRow, summaryRow } from 'common/models/summaryList/summaryList';
import { SummarySection, summarySection } from 'common/models/summaryList/summarySections';
import { formatDateToFullDate } from 'common/utils/dateUtils';
import { getAmount, getFinalPaymentDate, getFirstRepaymentDate, getPaymentAmount, getPaymentDate, getRepaymentFrequency } from 'common/utils/repaymentUtils';
import { t } from 'i18next';

const buildSummaryCourtDecisionByInstallments = (claim: Claim, lang: string): SummaryRow[] => {
  const fullName = claim.getDefendantFullName();
  const amount = getAmount(claim);
  const instalmentAmount = getPaymentAmount(claim);
  const frequency = t(`COMMON.PAYMENT_FREQUENCY.${getRepaymentFrequency(claim)}`, { lang })?.toLowerCase();
  const instalmentDate = formatDateToFullDate(getFirstRepaymentDate(claim));
  return [

    summaryRow(t('PAGES.CHECK_YOUR_ANSWER.COURT_REPAYMENT_PLAN', { lang }), t('PAGES.CHECK_YOUR_ANSWER.WILL_REPAY_IN_INSTALLMENTS', { lang, fullName, amount, instalmentAmount, instalmentDate, frequency })),
    summaryRow(t('PAGES.CHECK_YOUR_ANSWER.COMPLETION_DATE_CYA', { lang }), `${formatDateToFullDate(getFinalPaymentDate(claim))}`),
  ];
};

const buildSummaryCourtDecisionBySetDate = (claim: Claim, lang: string) => {
  const paymentDate = formatDateToFullDate(getPaymentDate(claim));
  return [
    summaryRow(t('PAGES.CHECK_YOUR_ANSWER.COURT_REPAYMENT_PLAN', { lang }), t('PAGES.CHECK_YOUR_ANSWER.REPAYMENT_IN_FULL', { lang, paymentDate })),
    summaryRow(t('PAGES.CHECK_YOUR_ANSWER.COMPLETION_DATE_CYA', { lang }), `${paymentDate}`),
  ];
};

const buildSummaryCourtDecisionStatement = (lang: string) => {
  return summaryRow(t('PAGES.CHECK_YOUR_ANSWER.COURT_DECISION_ROW', { lang }), t('PAGES.CHECK_YOUR_ANSWER.COURT_REJECTED_YOUR_REPAYMENT_PLAN', { lang }));
};

export const buildSummaryForCourtDecisionDetails = (claim: Claim, lang: string): SummarySection => {
  const claimantResponse = Object.assign(new ClaimantResponse(), claim.claimantResponse);
  const courtDecision = summarySection({
    title: t('PAGES.CHECK_YOUR_ANSWER.COURT_DECISION_SECTION', { lang }),
    summaryRows: [],
  });
  const isPayByInstallment = claimantResponse.isCourtDecisionInFavourOfDefendant && (claim.isPAPaymentOptionInstallments() || claim.isFAPaymentOptionInstallments());
  const isPayBySetDate = claimantResponse.isCourtDecisionInFavourOfDefendant && (claim.isPAPaymentOptionByDate() || claim.isFAPaymentOptionBySetDate());
  if (isPayByInstallment) {
    courtDecision.summaryList.rows.push(buildSummaryCourtDecisionStatement(lang));
    courtDecision.summaryList.rows.push(...buildSummaryCourtDecisionByInstallments(claim, lang));
  }

  if (isPayBySetDate) {
    courtDecision.summaryList.rows.push(buildSummaryCourtDecisionStatement(lang));
    courtDecision.summaryList.rows.push(...buildSummaryCourtDecisionBySetDate(claim, lang));
  }
  return courtDecision;
};