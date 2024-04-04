import { Claim } from 'common/models/claim';
import { ClaimantResponse } from 'common/models/claimantResponse';
import { SummaryRow, summaryRow } from 'common/models/summaryList/summaryList';
import { SummarySection, summarySection } from 'common/models/summaryList/summarySections';
import { formatDateToFullDate } from 'common/utils/dateUtils';
import {
  getAmount,
  getFinalPaymentDate, getFinalPaymentDateForClaimantPlan,
  getFirstRepaymentDate, getFirstRepaymentDateClaimantPlan,
  getPaymentAmount,
  getPaymentAmountClaimantPlan,
  getPaymentDate,
  getRepaymentFrequency, getRepaymentFrequencyForClaimantPlan,
} from 'common/utils/repaymentUtils';
import { t } from 'i18next';
import {PaymentDate} from 'form/models/admission/fullAdmission/paymentOption/paymentDate';

const buildSummaryCourtDecisionByInstallments = (claim: Claim, isClaimantPlanAccepted: boolean, lng: string): SummaryRow[] => {
  const fullName = claim.getDefendantFullName();
  const amount = getAmount(claim);
  const instalmentAmount = isClaimantPlanAccepted ? getPaymentAmountClaimantPlan(claim) : getPaymentAmount(claim);
  const paymentFrequency= isClaimantPlanAccepted ? getRepaymentFrequencyForClaimantPlan(claim) : getRepaymentFrequency(claim);
  const frequency = t(`COMMON.PAYMENT_FREQUENCY.${paymentFrequency}`, { lng })?.toLowerCase();

  const instalmentDate = isClaimantPlanAccepted ? formatDateToFullDate(getFirstRepaymentDateClaimantPlan(claim), lng) : formatDateToFullDate(getFirstRepaymentDate(claim), lng);
  return [

    summaryRow(t('PAGES.CHECK_YOUR_ANSWER.COURT_REPAYMENT_PLAN', { lng }), t('PAGES.CHECK_YOUR_ANSWER.WILL_REPAY_IN_INSTALLMENTS', { lng, fullName, amount, instalmentAmount, instalmentDate, frequency })),
    summaryRow(t('PAGES.CHECK_YOUR_ANSWER.COMPLETION_DATE_CYA', { lng }), `${isClaimantPlanAccepted?formatDateToFullDate(getFinalPaymentDateForClaimantPlan(claim),lng):formatDateToFullDate(getFinalPaymentDate(claim), lng)}`),
  ];
};

const buildSummaryCourtDecisionBySetDate = (claim: Claim, isClaimantPlanAccepted: boolean, lng: string) => {
  const date = claim.claimantResponse?.suggestedPaymentIntention?.paymentDate as unknown as PaymentDate;
  const paymentDate = t(formatDateToFullDate(isClaimantPlanAccepted ? date.date : getPaymentDate(claim), lng));
  return [
    summaryRow(t('PAGES.CHECK_YOUR_ANSWER.COURT_REPAYMENT_PLAN', { lng }), t('PAGES.CHECK_YOUR_ANSWER.REPAYMENT_IN_FULL', { lng, paymentDate })),
    summaryRow(t('PAGES.CHECK_YOUR_ANSWER.COMPLETION_DATE_CYA', { lng }), `${paymentDate}`),
  ];
};

const buildSummaryCourtDecisionImmediately = (claim: Claim, lng: string) => {
  const fullName = claim.getDefendantFullName();
  return [
    summaryRow(t('PAGES.CHECK_YOUR_ANSWER.COURT_REPAYMENT_PLAN', { lng }), t('PAGES.CHECK_YOUR_ANSWER.WILL_PAY_IMMEDIATELY', { lng, fullName })),
  ];
};

const buildSummaryCourtDecisionStatement = (claimantResponse: ClaimantResponse, lng: string) => {
  if (claimantResponse.isCourtDecisionInFavourOfClaimant) {
    return summaryRow(t('PAGES.CHECK_YOUR_ANSWER.COURT_DECISION_ROW', { lng }), t('PAGES.CHECK_YOUR_ANSWER.COURT_ACCEPTED_YOUR_REPAYMENT_PLAN', { lng }));
  } else {
    return summaryRow(t('PAGES.CHECK_YOUR_ANSWER.COURT_DECISION_ROW', { lng }), t('PAGES.CHECK_YOUR_ANSWER.COURT_REJECTED_YOUR_REPAYMENT_PLAN', { lng }));
  }
};

export const buildSummaryForCourtDecisionDetails = (claim: Claim, lng: string): SummarySection => {
  const claimantResponse = Object.assign(new ClaimantResponse(), claim.claimantResponse);
  const courtDecision = summarySection({
    title: t('PAGES.CHECK_YOUR_ANSWER.COURT_DECISION_SECTION', { lng }),
    summaryRows: [],
  });
  const isPayByInstallment = (claimantResponse.isCourtDecisionInFavourOfDefendant && (claim.isPAPaymentOptionInstallments() || claim.isFAPaymentOptionInstallments()))
    || (claimantResponse.isCourtDecisionInFavourOfClaimant && claimantResponse.isClaimantSuggestedPayByInstalments);
  const isPayBySetDate = (claimantResponse.isCourtDecisionInFavourOfDefendant && (claim.isPAPaymentOptionByDate() || claim.isFAPaymentOptionBySetDate()))
    || (claimantResponse.isCourtDecisionInFavourOfClaimant && claimantResponse.isClaimantSuggestedPayByDate);
  const isPayImmediately = claimantResponse.isCourtDecisionInFavourOfClaimant && claimantResponse.isClaimantSuggestedPayImmediately;
  if (isPayByInstallment) {
    courtDecision.summaryList.rows.push(buildSummaryCourtDecisionStatement(claimantResponse, lng));
    courtDecision.summaryList.rows.push(...buildSummaryCourtDecisionByInstallments(claim, claimantResponse.isCourtDecisionInFavourOfClaimant, lng));
  }
  if (isPayBySetDate) {
    courtDecision.summaryList.rows.push(buildSummaryCourtDecisionStatement(claimantResponse, lng));
    courtDecision.summaryList.rows.push(...buildSummaryCourtDecisionBySetDate(claim, claimantResponse.isCourtDecisionInFavourOfClaimant, lng));
  }
  if (isPayImmediately) {
    courtDecision.summaryList.rows.push(buildSummaryCourtDecisionStatement(claimantResponse, lng));
    courtDecision.summaryList.rows.push(...buildSummaryCourtDecisionImmediately(claim, lng));
  }
  if (claimantResponse.isCourtDecisionInFavourOfClaimant || claimantResponse.isCourtDecisionInFavourOfDefendant) return courtDecision;
};
