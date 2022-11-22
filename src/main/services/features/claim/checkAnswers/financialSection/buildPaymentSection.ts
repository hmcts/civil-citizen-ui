import {SummarySection, summarySection} from '../../../../../common/models/summaryList/summarySections';
import {Claim} from '../../../../../common/models/claim';
import {summaryRow} from '../../../../../common/models/summaryList/summaryList';
import {t} from 'i18next';
import {getLng} from '../../../../../common/utils/languageToggleUtils';
import {
  CCJ_CHECK_AND_SEND,
} from '../../../../../routes/urls';

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

  paymentDetailsSection.summaryList.rows.push(summaryRow(t('PAGES.CHECK_YOUR_ANSWER.CCJ_AMOUNT_ALREADY_PAID', {lng}),
    '', CCJ_CHECK_AND_SEND, changeLabel(lng)));

  paymentDetailsSection.summaryList.rows.push(summaryRow(t('PAGES.CHECK_YOUR_ANSWER.CCJ_TOTAL_TO_BE_PAID', {lng}),
    '', CCJ_CHECK_AND_SEND, changeLabel(lng)));

  paymentDetailsSection.summaryList.rows.push(summaryRow(t('PAGES.CHECK_YOUR_ANSWER.CCJ_HOW_TO_PAY', {lng}),
    '', CCJ_CHECK_AND_SEND, changeLabel(lng)));

  paymentDetailsSection.summaryList.rows.push(summaryRow(t('PAGES.CHECK_YOUR_ANSWER.CCJ_WHEN_DO_YOU_WANT_TO_BE_PAID_BY', {lng}),
    '', CCJ_CHECK_AND_SEND, changeLabel(lng)));

  return paymentDetailsSection;
};
