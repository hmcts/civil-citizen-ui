import {Claim} from 'models/claim';
import {PaymentSuccessfulSectionBuilder} from 'services/features/claim/paymentSuccessfulSectionBuilder';
import {convertToPoundsFilter, currencyFormatWithNoTrailingZeros} from 'common/utils/currencyFormat';
import {t} from 'i18next';
import {getLng} from 'common/utils/languageToggleUtils';

export const getPaymentSuccessfulPanelContent = (claim : Claim,lng?: string) => {
  return new PaymentSuccessfulSectionBuilder()
    .addPanel(claim.caseProgression.hearing.paymentInformation.paymentReference,lng)
    .build();
};

export const getPaymentSuccessfulBodyContent = (claim : Claim, calculatedAmountInPence : string, lng?: string) => {
  return new PaymentSuccessfulSectionBuilder()
    .addParagraph(t('PAGES.LATEST_UPDATE_CONTENT.CASE_PROGRESSION.HEARING_FEE.PAYMENT.SUCCESSFUL.CONFIRMATION', { lng: getLng(lng) }))
    .addTitle(t('PAGES.LATEST_UPDATE_CONTENT.CASE_PROGRESSION.HEARING_FEE.PAYMENT.SUCCESSFUL.PAYMENT_SUMMARY', { lng: getLng(lng) }))
    .addSummary(currencyFormatWithNoTrailingZeros(convertToPoundsFilter(
      calculatedAmountInPence)),
    t('COMMON.MICRO_TEXT.HEARING_FEE', { lng: getLng(lng) }),lng)
    .build();
};

export const getPaymentSuccessfulButtonContent = (redirectUrl : string) => {
  return new PaymentSuccessfulSectionBuilder()
    .addButton('COMMON.BUTTONS.CLOSE_AND_RETURN_TO_CASE_OVERVIEW', redirectUrl)
    .build();
};
