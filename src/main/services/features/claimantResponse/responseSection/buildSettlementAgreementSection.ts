import {summarySection, SummarySection} from 'models/summaryList/summarySections';
import {Claim} from 'models/claim';
import {t} from 'i18next';
import {summaryRow} from 'models/summaryList/summaryList';
import {formatDateToFullDate} from 'common/utils/dateUtils';
import {
  getAmount,
  getFinalPaymentDate,
  getFinalPaymentDateForClaimantPlan,
  getFirstRepaymentDate,
  getFirstRepaymentDateClaimantPlan,
  getPaymentAmount,
  getPaymentAmountClaimantPlan,
  getPaymentDate,
  getRepaymentFrequency,
  getRepaymentFrequencyForClaimantPlan,
} from 'common/utils/repaymentUtils';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {CCJ_EXTENDED_PAID_AMOUNT_URL, CLAIMANT_RESPONSE_CHOOSE_HOW_TO_PROCEED_URL} from 'routes/urls';
import {changeLabel} from 'common/utils/checkYourAnswer/changeButton';
import {getJudgmentAmountSummary} from '../ccj/judgmentAmountSummaryService';
import {YesNo, YesNoUpperCamelCase} from 'common/form/models/yesNo';
import {PaymentOptionType} from 'form/models/admission/paymentOption/paymentOptionType';
import {PaymentDate} from 'form/models/admission/fullAdmission/paymentOption/paymentDate';

export const buildSummaryForPayBySetDate = (claim: Claim, claimId: string, lng: string,isClaimantPlanAccepted: boolean): SummarySection => {
  const date = claim.claimantResponse?.suggestedPaymentIntention?.paymentDate as unknown as PaymentDate;
  const paymentDate = t(formatDateToFullDate(isClaimantPlanAccepted? date.date:getPaymentDate(claim), lng));
  const fullName = claim.getDefendantFullName();
  const amount = getAmount(claim);
  return summarySection({
    title: t('PAGES.CHECK_YOUR_ANSWER.SETTLEMENT_AGREEMENT', { lng }),
    summaryRows: [
      summaryRow(t('PAGES.CHECK_YOUR_ANSWER.THE_AGREEMENT_CYA', { lng }), t('PAGES.CHECK_YOUR_ANSWER.WILL_PAY_BY_PAYMENT_DATE', { fullName, amount, paymentDate, lng }), constructResponseUrlWithIdParams(claimId, CLAIMANT_RESPONSE_CHOOSE_HOW_TO_PROCEED_URL), changeLabel(lng)),
      summaryRow(t('PAGES.CHECK_YOUR_ANSWER.COMPLETION_DATE_CYA', { lng }), `${paymentDate}`),
    ],
  });
};

export const buildSummaryForPayByInstalments = (claim: Claim, claimId: string, lng: string,isClaimantPlanAccepted: boolean): SummarySection => {
  const fullName = claim.getDefendantFullName();
  const amount = getAmount(claim);
  const instalmentAmount = isClaimantPlanAccepted ? getPaymentAmountClaimantPlan(claim) : getPaymentAmount(claim);
  const paymentFrequency= isClaimantPlanAccepted ? getRepaymentFrequencyForClaimantPlan(claim) : getRepaymentFrequency(claim);
  const frequency = t(`COMMON.PAYMENT_FREQUENCY.${paymentFrequency}`, { lng })?.toLowerCase();

  const instalmentDate = isClaimantPlanAccepted ? formatDateToFullDate(getFirstRepaymentDateClaimantPlan(claim), lng) : formatDateToFullDate(getFirstRepaymentDate(claim), lng);
  return summarySection({
    title: t('PAGES.CHECK_YOUR_ANSWER.SETTLEMENT_AGREEMENT', { lng }),
    summaryRows: [
      summaryRow(t('PAGES.CHECK_YOUR_ANSWER.THE_AGREEMENT_CYA', { lng }), t('PAGES.CHECK_YOUR_ANSWER.WILL_REPAY_IN_INSTALLMENTS', { lng, fullName, amount, instalmentAmount, instalmentDate, frequency }), constructResponseUrlWithIdParams(claimId, CLAIMANT_RESPONSE_CHOOSE_HOW_TO_PROCEED_URL), changeLabel(lng)),
      summaryRow(t('PAGES.CHECK_YOUR_ANSWER.COMPLETION_DATE_CYA', { lng }), `${isClaimantPlanAccepted?formatDateToFullDate(getFinalPaymentDateForClaimantPlan(claim),lng):formatDateToFullDate(getFinalPaymentDate(claim), lng)}`),
    ],
  });
};

export const buildSettlementAgreementSection = (claim: Claim, claimId: string, lng: string): SummarySection => {
  const isSignSettlement = claim.isSignASettlementAgreement();
  const isSignSettlementForPayBySetDate = isSignSettlement && (claim.isPAPaymentOptionByDate() || claim.isFAPaymentOptionBySetDate());
  const isSignSettlementForPayByInstallments = isSignSettlement && (claim.isPAPaymentOptionInstallments() || claim.isFAPaymentOptionInstallments());
  if (claim.hasCourtAcceptedClaimantsPlan()) {
    if (claim.getSuggestedPaymentIntentionOptionFromClaimant() === PaymentOptionType.BY_SET_DATE) {
      return buildSummaryForPayBySetDate(claim, claimId, lng,true);
    } else if (claim.getSuggestedPaymentIntentionOptionFromClaimant() === PaymentOptionType.INSTALMENTS) {
      return buildSummaryForPayByInstalments(claim, claimId, lng,true);
    }
  }else {
    if (isSignSettlementForPayBySetDate) {
      return buildSummaryForPayBySetDate(claim, claimId, lng, false);
    }
    if (isSignSettlementForPayByInstallments) {
      return buildSummaryForPayByInstalments(claim, claimId, lng, false);
    }
  }
};

export const buildJudgmentRequestSection = (claim: Claim, claimId: string, lng: string, claimFee: number): SummarySection => {
  const judgmentSummaryDetails = getJudgmentAmountSummary(claim, claimFee, lng);
  const ccjPaidAmountHref = constructResponseUrlWithIdParams(claimId, CCJ_EXTENDED_PAID_AMOUNT_URL);
  const paymentOption = claim.getHasDefendantPaid();

  const judgmentRequestSection = summarySection({
    title: t('PAGES.CHECK_YOUR_ANSWER.JUDGMENT_REQUEST', {lng}),
    summaryRows: [
      summaryRow(t('PAGES.CHECK_YOUR_ANSWER.CCJ_HAS_DEFENDANT_PAID_SOME', {lng}),
        paymentOption === YesNo.YES ? YesNoUpperCamelCase.YES : YesNoUpperCamelCase.NO, ccjPaidAmountHref, changeLabel(lng)),
    ],
  });
  if (claim.getDefendantPaidAmount()) {
    judgmentRequestSection.summaryList.rows.push(summaryRow(t('PAGES.CHECK_YOUR_ANSWER.CCJ_AMOUNT_ALREADY_PAID', {lng}),
      '£' + (judgmentSummaryDetails.alreadyPaidAmount).toFixed(2).toString()));
  }

  if (claim.getHasDefendantPaid) {
    judgmentRequestSection.summaryList.rows.push(summaryRow(t('PAGES.CHECK_YOUR_ANSWER.CCJ_TOTAL_TO_BE_PAID', {lng}), '£' + judgmentSummaryDetails.total));
  }
  return judgmentRequestSection;
};
