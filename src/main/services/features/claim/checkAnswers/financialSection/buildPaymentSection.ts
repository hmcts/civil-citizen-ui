import {SummarySection, summarySection} from 'models/summaryList/summarySections';
import {Claim} from 'models/claim';
import {summaryRow} from 'models/summaryList/summaryList';
import {t} from 'i18next';
import {getLng} from 'common/utils/languageToggleUtils';
import {CCJ_PAID_AMOUNT_URL} from 'routes/urls';
import {formatDateToFullDate} from 'common/utils/dateUtils';
import {CcjPaymentOption} from 'form/models/claimantResponse/ccj/ccjPaymentOption';
import {GenericForm} from 'form/models/genericForm';
import {currencyFormatWithNoTrailingZeros} from 'common/utils/currencyFormat';
import {TransactionSchedule} from 'form/models/statementOfMeans/expensesAndIncome/transactionSchedule';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {PaymentOptionType} from 'form/models/admission/paymentOption/paymentOptionType';

const changeLabel = (lang: string): string => t('COMMON.BUTTONS.CHANGE', {lng: lang});

export const buildPaymentDetailsSection = (claim: Claim, claimId: string, lang: string | unknown): SummarySection => {
  const lng = getLng(lang);
  const ccjPaidAmountHref = constructResponseUrlWithIdParams(claimId, CCJ_PAID_AMOUNT_URL);
  const paymentOption = claim.getHasDefendantPaid();
  const paymentOptionTranslationKey = paymentOption ? `COMMON.VARIATION.${paymentOption.toUpperCase()}` : '';
  const paymentOptionText = paymentOptionTranslationKey ? t(paymentOptionTranslationKey, {lng}) : '';
  const paymentDetailsSection = summarySection({
    title: t('PAGES.CHECK_YOUR_ANSWER.PAYMENT_TITLE', {lng}),
    summaryRows: [
      summaryRow(t('PAGES.CHECK_YOUR_ANSWER.CCJ_HAS_DEFENDANT_PAID_SOME', {lng}),
        paymentOptionText?.charAt(0).toUpperCase() + paymentOptionText?.substring(1), ccjPaidAmountHref, changeLabel(lng)),
    ],
  });

  if(claim.getDefendantPaidAmount()) {
    paymentDetailsSection.summaryList.rows.push(summaryRow(t('PAGES.CHECK_YOUR_ANSWER.CCJ_AMOUNT_ALREADY_PAID', {lng}),
      currencyFormatWithNoTrailingZeros(claim.getDefendantPaidAmount())));
  }

  if(claim.getHasDefendantPaid()) {
    const amountToBePaid = ((claim.getDefendantPaidAmount()) ?
      claim.getCCJTotalAmount() - claim.getDefendantPaidAmount() :
      claim.getCCJTotalAmount());
    paymentDetailsSection.summaryList.rows.push(summaryRow(t('PAGES.CHECK_YOUR_ANSWER.CCJ_TOTAL_TO_BE_PAID', {lng}),
      currencyFormatWithNoTrailingZeros(amountToBePaid)));
  }

  if(claim.getCCJPaymentOption()) {
    const ccjPaymentOption = new GenericForm(new CcjPaymentOption(claim.getCCJPaymentOption()));
    paymentDetailsSection.summaryList.rows.push(summaryRow(t('PAGES.CHECK_YOUR_ANSWER.CCJ_HOW_TO_PAY', {lng}),
      formatOptionType(claim.getCCJPaymentOption(), lng)));

    if (ccjPaymentOption.model.isCcjPaymentOptionBySetDate() && claim.getCCJPaymentDate()) {
      paymentDetailsSection.summaryList.rows.push(summaryRow(t('PAGES.CHECK_YOUR_ANSWER.CCJ_WHEN_DO_YOU_WANT_TO_BE_PAID_BY', {lng}),
        formatDateToFullDate(claim.getCCJPaymentDate(), lng)));
    }

    if (ccjPaymentOption.model.isCcjPaymentOptionInstalments() && claim.getCCJRepaymentPlan()) {
      paymentDetailsSection.summaryList.rows.push(summaryRow(t('PAGES.CHECK_YOUR_ANSWER.CCJ_INSTALMENTS_OF', {lng}),
        currencyFormatWithNoTrailingZeros(claim.getCCJRepaymentPlanAmount())));
    }

    if (ccjPaymentOption.model.isCcjPaymentOptionInstalments() && claim.getCCJRepaymentPlanDate()) {
      paymentDetailsSection.summaryList.rows.push(summaryRow(t('PAGES.CHECK_YOUR_ANSWER.CCJ_FIRST_PAYMENT_DATE', {lng}),
        formatDateToFullDate(claim.getCCJRepaymentPlanDate(), lng)));
    }

    if (ccjPaymentOption.model.isCcjPaymentOptionInstalments() && claim.getCCJRepaymentPlan()) {
      paymentDetailsSection.summaryList.rows.push(summaryRow(t('PAGES.CHECK_YOUR_ANSWER.CCJ_INSTALMENTS_PAYMENT_FREQUENCY', {lng}),
        formatPaymentFrequency(claim.getCCJRepaymentPlanFrequency(), lng)));
    }
  }

  function formatPaymentFrequency(paymentFrequency: TransactionSchedule, lng: string) {
    if(paymentFrequency === TransactionSchedule.WEEK){
      return t('COMMON.PAYMENT_FREQUENCY.WEEK', {lng});
    }else if(paymentFrequency === TransactionSchedule.TWO_WEEKS){
      return t('COMMON.PAYMENT_FREQUENCY.TWO_WEEKS', {lng});
    }else if(paymentFrequency === TransactionSchedule.MONTH){
      return t('COMMON.PAYMENT_FREQUENCY.MONTH', {lng});
    }
  }

  function formatOptionType(type: PaymentOptionType, lng: string) {
    if(type === PaymentOptionType.INSTALMENTS) {
      return t('COMMON.PAYMENT_OPTION.INSTALMENTS', {lng});
    }else if(type === PaymentOptionType.BY_SET_DATE){
      return t('COMMON.PAYMENT_OPTION.BY_SET_DATE', {lng});
    }else if(type === PaymentOptionType.IMMEDIATELY){
      return t('COMMON.PAYMENT_OPTION.IMMEDIATELY', {lng});
    }
  }

  return paymentDetailsSection;
};
