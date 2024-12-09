import { Claim } from 'common/models/claim';
import {convertToPoundsFilter, currencyFormatWithNoTrailingZeros} from 'common/utils/currencyFormat';
import {PaymentSuccessfulSectionBuilder} from 'services/features/claim/paymentSuccessfulSectionBuilder';
import { getLng } from 'common/utils/languageToggleUtils';
import {ApplicationResponse} from 'models/generalApplication/applicationResponse';

export const getGaPaymentSuccessfulPanelContent = (claim: Claim, withoutFee: boolean, isAdditionalFee: boolean, lng?: string, appResponse?: ApplicationResponse) => {
  const panelBuilder = new PaymentSuccessfulSectionBuilder();
  if (withoutFee) {
    panelBuilder.addPanelForConfirmation('PAGES.GENERAL_APPLICATION.GA_PAYMENT_SUCCESSFUL.APPLICATION_SUBMITTED', lng);
  } else {
    const paymentReference = isAdditionalFee
      ? appResponse?.case_data?.generalAppPBADetails?.additionalPaymentDetails.reference
      : appResponse?.case_data?.generalAppPBADetails?.paymentDetails.reference;
    panelBuilder.addPanel(paymentReference, lng);
  }
  return panelBuilder.build();
};

export const getGaPaymentSuccessfulBodyContent = (claim: Claim, calculatedAmountInPence : string, isAdditionalFee: boolean, withoutFee: boolean, displaySyncWarning: boolean, lng?: string) => {
  const contentBuilder = new PaymentSuccessfulSectionBuilder()
    .addParagraph('PAGES.PAYMENT_CONFIRMATION.SUCCESSFUL.CONFIRMATION', { lng: getLng(lng) });
  if (displaySyncWarning) {
    contentBuilder
      .addWarning('PAGES.GENERAL_APPLICATION.GA_PAYMENT_SUCCESSFUL.ACCOUNT_NOT_UPDATED');
  }
  contentBuilder
    .addTitle('PAGES.GENERAL_APPLICATION.GA_PAYMENT_SUCCESSFUL.WHAT_HAPPENS_NEXT',{ lng: getLng(lng) });
  if (isAdditionalFee) {
    contentBuilder
      .addParagraph('PAGES.GENERAL_APPLICATION.GA_PAYMENT_SUCCESSFUL.WHAT_HAPPENS_NEXT_PARA_5', {lng: getLng(lng)})
      .addParagraph('PAGES.GENERAL_APPLICATION.GA_PAYMENT_SUCCESSFUL.WHAT_HAPPENS_NEXT_PARA_6', {lng: getLng(lng)})
      .addParagraph('PAGES.GENERAL_APPLICATION.GA_PAYMENT_SUCCESSFUL.WHAT_HAPPENS_NEXT_PARA_3', {lng: getLng(lng)})
      .addParagraph('PAGES.GENERAL_APPLICATION.GA_PAYMENT_SUCCESSFUL.WHAT_HAPPENS_NEXT_PARA_4', {lng: getLng(lng)})
      .addParagraph('COMMON.IF_NECESSARY_DOCUMENTS', {lng: getLng(lng)});
  } else {
    if (withoutFee) {
      contentBuilder
        .addParagraph('PAGES.GENERAL_APPLICATION.GA_PAYMENT_SUCCESSFUL.WHAT_HAPPENS_NEXT_PARA_5', {lng: getLng(lng)});
    } else {
      contentBuilder
        .addParagraph('PAGES.GENERAL_APPLICATION.GA_PAYMENT_SUCCESSFUL.WHAT_HAPPENS_NEXT_PARA_1', { lng: getLng(lng) });
    }
    contentBuilder
      .addParagraph('PAGES.GENERAL_APPLICATION.GA_PAYMENT_SUCCESSFUL.WHAT_HAPPENS_NEXT_PARA_2', {lng: getLng(lng)})
      .addParagraph('PAGES.GENERAL_APPLICATION.GA_PAYMENT_SUCCESSFUL.WHAT_HAPPENS_NEXT_PARA_3', {lng: getLng(lng)})
      .addParagraph('PAGES.GENERAL_APPLICATION.GA_PAYMENT_SUCCESSFUL.WHAT_HAPPENS_NEXT_PARA_4', {lng: getLng(lng)})
      .addParagraph('COMMON.IF_NECESSARY_DOCUMENTS', {lng: getLng(lng)});

    if (!withoutFee) {
      contentBuilder
        .addTitle('PAGES.GENERAL_APPLICATION.GA_PAYMENT_SUCCESSFUL.CHOOSEN_NOT_TO_INFORM_OTHER_PARTY', {lng: getLng(lng)})
        .addParagraph('PAGES.GENERAL_APPLICATION.GA_PAYMENT_SUCCESSFUL.CHOOSEN_NOT_TO_INFORM_OTHER_PARTY_PARA_1', {lng: getLng(lng)})
        .addParagraph('PAGES.GENERAL_APPLICATION.GA_PAYMENT_SUCCESSFUL.CHOOSEN_NOT_TO_INFORM_OTHER_PARTY_PARA_2', {lng: getLng(lng)});
    }
  }

  contentBuilder.addTitle('PAGES.GENERAL_APPLICATION.GA_PAYMENT_SUCCESSFUL.PAYMENT_SUMMARY_TITLE', { lng: getLng(lng) })
    .addSummary(currencyFormatWithNoTrailingZeros(convertToPoundsFilter(
      calculatedAmountInPence)),
    isAdditionalFee ? 'COMMON.MICRO_TEXT.ADDITIONAL_APPLICATION_FEE' : 'COMMON.MICRO_TEXT.APPLICATION_FEE',
    lng);
  return contentBuilder.build();
};

export const getGaPaymentSuccessfulButtonContent = (redirectUrl : string) => {
  return new PaymentSuccessfulSectionBuilder()
    .addButton('COMMON.BUTTONS.CLOSE_AND_RETURN_TO_DASHBOARD', redirectUrl)
    .build();
};
