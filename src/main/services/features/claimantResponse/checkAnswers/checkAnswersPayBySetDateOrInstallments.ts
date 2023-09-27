import { Claim } from "common/models/claim";
import { SummaryRow, summaryRow } from "common/models/summaryList/summaryList";
import { changeLabel } from "common/utils/checkYourAnswer/changeButton";
import { formatDateToFullDate } from "common/utils/dateUtils";
import { getAmount, getFinalPaymentDate, getFirstRepaymentDate, getPaymentAmount, getPaymentDate, getRepaymentFrequency } from "common/utils/repaymentUtils";
import { constructResponseUrlWithIdParams } from "common/utils/urlFormatter";
import { t } from "i18next";
import { CLAIMANT_RESPONSE_CHOOSE_HOW_TO_PROCEED_URL } from "routes/urls";

export const buildSummaryForPayBySetDate = (claim: Claim, claimId: string, lang: string | unknown): SummaryRow[] => {
    const paymentDate = formatDateToFullDate(getPaymentDate(claim));
    const fullName = claim.getDefendantFullName();
    const amount = getAmount(claim);
    return [
        summaryRow(t('PAGES.CHECK_YOUR_ANSWER.THE_AGREEMENT_CYA', { lang }), t('PAGES.CHECK_YOUR_ANSWER.WILL_PAY_BY_PAYMENT_DATE', { fullName, amount, paymentDate, lang }), constructResponseUrlWithIdParams(claimId, CLAIMANT_RESPONSE_CHOOSE_HOW_TO_PROCEED_URL), changeLabel(lang as string)),
        summaryRow(t('PAGES.CHECK_YOUR_ANSWER.COMPLETION_DATE_CYA', { lang }), `${paymentDate}`),
    ];
};

export const buildSummaryForPayByInstallments = (claim: Claim, claimId: string, lang: string | unknown): SummaryRow[] => {
    const fullName = claim.getDefendantFullName();
    const amount = getAmount(claim);
    const instalmentAmount = getPaymentAmount(claim);
    const frequency = t(`COMMON.PAYMENT_FREQUENCY.${getRepaymentFrequency(claim)}`, { lang })?.toLowerCase();
    const instalmentDate = formatDateToFullDate(getFirstRepaymentDate(claim));
    return [
        summaryRow(t('PAGES.CHECK_YOUR_ANSWER.THE_AGREEMENT_CYA', { lang }), t('PAGES.CHECK_YOUR_ANSWER.WILL_REPAY_IN_INSTALLMENTS', { lang, fullName, amount, instalmentAmount, instalmentDate, frequency }), constructResponseUrlWithIdParams(claimId, CLAIMANT_RESPONSE_CHOOSE_HOW_TO_PROCEED_URL), changeLabel(lang as string)),
        summaryRow(t('PAGES.CHECK_YOUR_ANSWER.COMPLETION_DATE_CYA', { lang }), `${formatDateToFullDate(getFinalPaymentDate(claim))}`),
    ];

};