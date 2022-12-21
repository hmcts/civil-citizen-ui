import {SummarySection, summarySection} from 'models/summaryList/summarySections';
import {Claim} from 'models/claim';
import {summaryRow} from 'models/summaryList/summaryList';
import {t} from 'i18next';
import {getLng} from 'common/utils/languageToggleUtils';
import {
  CCJ_CHECK_AND_SEND_URL,
} from 'routes/urls';
import {formatDateToFullDate} from 'common/utils/dateUtils';
import {CcjPaymentOption} from 'form/models/claimantResponse/ccj/ccjPaymentOption';
import {GenericForm} from 'form/models/genericForm';
import {currencyFormatWithNoTrailingZeros} from 'common/utils/currencyFormat';
import {TransactionSchedule} from 'form/models/statementOfMeans/expensesAndIncome/transactionSchedule';

const changeLabel = (lang: string): string => t('COMMON.BUTTONS.CHANGE', {lng: lang});

export const buildPaymentDetailsSection = (claim: Claim, claimId: string, lang: string | unknown): SummarySection => {
  const lng = getLng(lang);
  const paymentOption = claim.claimantResponse?.ccjRequest?.paidAmount?.option;
  const paymentDetailsSection = summarySection({
    title: t('PAGES.CHECK_YOUR_ANSWER.PAYMENT_TITLE', {lng}),
    summaryRows: [
      summaryRow(t('PAGES.CHECK_YOUR_ANSWER.CCJ_HAS_DEFENDANT_PAID_SOME', {lng}),
        paymentOption.charAt(0).toUpperCase() + paymentOption.substring(1), CCJ_CHECK_AND_SEND_URL, changeLabel(lng)),
    ],
  });

  if(claim.claimantResponse?.ccjRequest?.paidAmount?.amount) {
    paymentDetailsSection.summaryList.rows.push(summaryRow(t('PAGES.CHECK_YOUR_ANSWER.CCJ_AMOUNT_ALREADY_PAID', {lng}),
      currencyFormatWithNoTrailingZeros(claim.claimantResponse.ccjRequest.paidAmount.amount), CCJ_CHECK_AND_SEND_URL));
  }

  if(claim.claimantResponse?.ccjRequest?.paidAmount) {
    const amountToBePaid = ((claim.claimantResponse.ccjRequest.paidAmount.amount) ?
      claim.claimantResponse.ccjRequest.paidAmount.totalAmount - claim.claimantResponse.ccjRequest.paidAmount.amount :
      claim.claimantResponse.ccjRequest.paidAmount.totalAmount);
    paymentDetailsSection.summaryList.rows.push(summaryRow(t('PAGES.CHECK_YOUR_ANSWER.CCJ_TOTAL_TO_BE_PAID', {lng}),
      currencyFormatWithNoTrailingZeros(amountToBePaid), CCJ_CHECK_AND_SEND_URL));
  }

  if(claim.claimantResponse?.ccjRequest?.ccjPaymentOption?.type) {
    const ccjPaymentOption = new GenericForm(new CcjPaymentOption(claim.claimantResponse.ccjRequest.ccjPaymentOption.type));
    paymentDetailsSection.summaryList.rows.push(summaryRow(t('PAGES.CHECK_YOUR_ANSWER.CCJ_HOW_TO_PAY', {lng}),
      ccjPaymentOption.model.formatOptionType(claim.claimantResponse.ccjRequest.ccjPaymentOption.type), CCJ_CHECK_AND_SEND_URL));

    if (ccjPaymentOption.model.isCcjPaymentOptionBySetDate() && claim.claimantResponse?.ccjRequest?.defendantPaymentDate?.date) {
      paymentDetailsSection.summaryList.rows.push(summaryRow(t('PAGES.CHECK_YOUR_ANSWER.CCJ_WHEN_DO_YOU_WANT_TO_BE_PAID_BY', {lng}),
        formatDateToFullDate(claim.claimantResponse.ccjRequest.defendantPaymentDate.date), CCJ_CHECK_AND_SEND_URL));
    }

    if (ccjPaymentOption.model.isCcjPaymentOptionInstalments() && claim.claimantResponse?.ccjRequest?.repaymentPlanInstalments) {
      paymentDetailsSection.summaryList.rows.push(summaryRow(t('PAGES.CHECK_YOUR_ANSWER.CCJ_INSTALMENTS_OF', {lng}),
        currencyFormatWithNoTrailingZeros(claim.claimantResponse.ccjRequest.repaymentPlanInstalments.amount), CCJ_CHECK_AND_SEND_URL));
    }

    if (ccjPaymentOption.model.isCcjPaymentOptionInstalments() && claim.claimantResponse?.ccjRequest?.repaymentPlanInstalments?.firstPaymentDate) {
      paymentDetailsSection.summaryList.rows.push(summaryRow(t('PAGES.CHECK_YOUR_ANSWER.CCJ_FIRST_PAYMENT_DATE', {lng}),
        formatDateToFullDate(claim.claimantResponse.ccjRequest.repaymentPlanInstalments.firstPaymentDate.date), CCJ_CHECK_AND_SEND_URL));
    }

    if (ccjPaymentOption.model.isCcjPaymentOptionInstalments() && claim.claimantResponse?.ccjRequest?.repaymentPlanInstalments) {
      paymentDetailsSection.summaryList.rows.push(summaryRow(t('PAGES.CHECK_YOUR_ANSWER.CCJ_INSTALMENTS_PAYMENT_FREQUENCY', {lng}),
        formatPaymentFrequency(claim.claimantResponse.ccjRequest.repaymentPlanInstalments.paymentFrequency), CCJ_CHECK_AND_SEND_URL));
    }
  }

  function formatPaymentFrequency(paymentFrequency: TransactionSchedule) {
    if(paymentFrequency === TransactionSchedule.WEEK){
      return 'Each week';
    }else if(paymentFrequency === TransactionSchedule.TWO_WEEKS){
      return 'Every two weeks';
    }else if(paymentFrequency === TransactionSchedule.MONTH){
      return 'Every month';
    }
  }

  return paymentDetailsSection;
};
