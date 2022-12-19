import {SummarySection, summarySection} from '../../../../../common/models/summaryList/summarySections';
import {Claim} from '../../../../../common/models/claim';
import {summaryRow} from '../../../../../common/models/summaryList/summaryList';
import {t} from 'i18next';
import {getLng} from '../../../../../common/utils/languageToggleUtils';
import {
  CCJ_CHECK_AND_SEND,
} from '../../../../../routes/urls';
import {formatDateToFullDate} from 'common/utils/dateUtils';
import {CcjPaymentOption} from 'form/models/claimantResponse/ccj/ccjPaymentOption';
import {GenericForm} from 'form/models/genericForm';

const changeLabel = (lang: string): string => t('COMMON.BUTTONS.CHANGE', {lng: lang});

export const buildPaymentDetailsSection = (claim: Claim, claimId: string, lang: string | unknown): SummarySection => {
  const lng = getLng(lang);
  const paymentDetailsSection = summarySection({
    title: t('PAGES.CHECK_YOUR_ANSWER.PAYMENT_TITLE', {lng}),
    summaryRows: [
      summaryRow(t('PAGES.CHECK_YOUR_ANSWER.CCJ_HAS_DEFENDANT_PAID_SOME', {lng}),
        JSON.stringify(claim.claimantResponse?.hasPartPaymentBeenAccepted), CCJ_CHECK_AND_SEND, changeLabel(lng)),
    ],
  });

  if(claim.claimantResponse?.ccjRequest?.paidAmount) {
    paymentDetailsSection.summaryList.rows.push(summaryRow(t('PAGES.CHECK_YOUR_ANSWER.CCJ_AMOUNT_ALREADY_PAID', {lng}),
      JSON.stringify(claim.claimantResponse.ccjRequest.paidAmount.amount), CCJ_CHECK_AND_SEND));
  }

  if(claim.claimantResponse?.ccjRequest?.paidAmount) {
    const toBePaid = claim.claimantResponse.ccjRequest.paidAmount.totalAmount - claim.claimantResponse.ccjRequest.paidAmount.amount;
    paymentDetailsSection.summaryList.rows.push(summaryRow(t('PAGES.CHECK_YOUR_ANSWER.CCJ_TOTAL_TO_BE_PAID', {lng}),
      JSON.stringify(toBePaid), CCJ_CHECK_AND_SEND));
  }

  let ccjPaymentOption;
  if(claim.claimantResponse?.ccjRequest?.ccjPaymentOption?.type) {
    ccjPaymentOption = new GenericForm(new CcjPaymentOption(claim.claimantResponse.ccjRequest.ccjPaymentOption.type));
    paymentDetailsSection.summaryList.rows.push(summaryRow(t('PAGES.CHECK_YOUR_ANSWER.CCJ_HOW_TO_PAY', {lng}),
      JSON.stringify(ccjPaymentOption), CCJ_CHECK_AND_SEND));
  }

  if(ccjPaymentOption.model.isCcjPaymentOptionBySetDate() && claim.claimantResponse?.ccjRequest?.defendantPaymentDate?.date) {
    paymentDetailsSection.summaryList.rows.push(summaryRow(t('PAGES.CHECK_YOUR_ANSWER.CCJ_WHEN_DO_YOU_WANT_TO_BE_PAID_BY', {lng}),
      formatDateToFullDate(claim.claimantResponse.ccjRequest.defendantPaymentDate.date), CCJ_CHECK_AND_SEND));
  }

  if(ccjPaymentOption.model.isCcjPaymentOptionInstalments()) {
    paymentDetailsSection.summaryList.rows.push(summaryRow(t('PAGES.CHECK_YOUR_ANSWER.CCJ_INSTALMENTS_OF', {lng}),
      '', CCJ_CHECK_AND_SEND));
  }

  if(ccjPaymentOption.model.isCcjPaymentOptionInstalments()) {
    paymentDetailsSection.summaryList.rows.push(summaryRow(t('PAGES.CHECK_YOUR_ANSWER.CCJ_FIRST_PAYMENT_DATE', {lng}),
      '', CCJ_CHECK_AND_SEND));
  }

  if(ccjPaymentOption.model.isCcjPaymentOptionInstalments()) {
    paymentDetailsSection.summaryList.rows.push(summaryRow(t('PAGES.CHECK_YOUR_ANSWER.CCJ_INSTALMENTS_PAYMENT_FREQUENCY', {lng}),
      '', CCJ_CHECK_AND_SEND));
  }

  return paymentDetailsSection;
};
