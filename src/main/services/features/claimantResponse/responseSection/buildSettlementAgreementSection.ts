import {summarySection, SummarySection} from 'models/summaryList/summarySections';
import {Claim} from 'models/claim';
import {t} from 'i18next';
import {summaryRow} from 'models/summaryList/summaryList';
import {formatDateToFullDate} from 'common/utils/dateUtils';
import {
  getAmount, getFinalPaymentDate,
  getFirstRepaymentDate,
  getPaymentAmount,
  getPaymentDate,
  getRepaymentFrequency,
} from 'common/utils/repaymentUtils';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {CLAIMANT_RESPONSE_CHOOSE_HOW_TO_PROCEED_URL} from 'routes/urls';
import {changeLabel} from 'common/utils/checkYourAnswer/changeButton';

export const buildSummaryForPayBySetDate = (claim: Claim, claimId: string, lang: string | unknown): SummarySection => {
  const paymentDate = formatDateToFullDate(getPaymentDate(claim));
  const fullName = claim.getDefendantFullName();
  const amount = getAmount(claim);
  return summarySection({
    title: t('PAGES.CHECK_YOUR_ANSWER.SETTLEMENT_AGREEMENT', { lang }),
    summaryRows: [
      summaryRow(t('PAGES.CHECK_YOUR_ANSWER.THE_AGREEMENT_CYA', { lang }), t('PAGES.CHECK_YOUR_ANSWER.WILL_PAY_BY_PAYMENT_DATE', { fullName, amount, paymentDate, lang }), constructResponseUrlWithIdParams(claimId, CLAIMANT_RESPONSE_CHOOSE_HOW_TO_PROCEED_URL), changeLabel(lang as string)),
      summaryRow(t('PAGES.CHECK_YOUR_ANSWER.COMPLETION_DATE_CYA', { lang }), `${paymentDate}`),
    ],
  });
};

export const buildSummaryForPayByInstallments = (claim: Claim, claimId: string, lang: string | unknown): SummarySection => {
  const fullName = claim.getDefendantFullName();
  const amount = getAmount(claim);
  const instalmentAmount = getPaymentAmount(claim);
  const frequency = t(`COMMON.PAYMENT_FREQUENCY.${getRepaymentFrequency(claim)}`, { lang })?.toLowerCase();
  const instalmentDate = formatDateToFullDate(getFirstRepaymentDate(claim));
  return summarySection({
    title: t('PAGES.CHECK_YOUR_ANSWER.SETTLEMENT_AGREEMENT', { lang }),
    summaryRows: [
      summaryRow(t('PAGES.CHECK_YOUR_ANSWER.THE_AGREEMENT_CYA', { lang }), t('PAGES.CHECK_YOUR_ANSWER.WILL_REPAY_IN_INSTALLMENTS', { lang, fullName, amount, instalmentAmount, instalmentDate, frequency }), constructResponseUrlWithIdParams(claimId, CLAIMANT_RESPONSE_CHOOSE_HOW_TO_PROCEED_URL), changeLabel(lang as string)),
      summaryRow(t('PAGES.CHECK_YOUR_ANSWER.COMPLETION_DATE_CYA', { lang }), `${formatDateToFullDate(getFinalPaymentDate(claim))}`),
    ],
  });
};

export const buildSettlementAgreementSection = (claim: Claim, claimId: string, lang: string | unknown): SummarySection => {
  const isSignSettlement = claim.isSignASettlementAgreement();
  const isSignSettlementForPayBySetDate = isSignSettlement && (claim.isPAPaymentOptionByDate() || claim.isFAPaymentOptionBySetDate());
  const isSignSettlementForPayByInstallments = isSignSettlement && (claim.isPAPaymentOptionInstallments() || claim.isFAPaymentOptionInstallments());

  if (isSignSettlementForPayBySetDate)
    return buildSummaryForPayBySetDate(claim, claimId, lang);

  if (isSignSettlementForPayByInstallments)
    return buildSummaryForPayByInstallments(claim, claimId, lang);
};
