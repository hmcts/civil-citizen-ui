import { Claim } from 'common/models/claim';
import {convertToPoundsFilter, currencyFormatWithNoTrailingZeros} from 'common/utils/currencyFormat';
import {PaymentSuccessfulSectionBuilder} from 'services/features/claim/paymentSuccessfulSectionBuilder';
import { getLng } from 'common/utils/languageToggleUtils';

export const getGaPaymentSuccessfulPanelContent = (claim: Claim, lng?: string) => {
  return new PaymentSuccessfulSectionBuilder()
    .addPanel("REF-123-123", lng)
    .build();
};

export const getGaPaymentSuccessfulBodyContent = (claim: Claim, lng?: string) => {
  return new PaymentSuccessfulSectionBuilder()
    .addParagraph('PAGES.PAYMENT_CONFIRMATION.SUCCESSFUL.CONFIRMATION', { lng: getLng(lng) })
    .addTitle('PAGES.GENERAL_APPLICATION.GA_PAYMENT_SUCCESSFUL.WHAT_HAPPENS_NEXT',{ lng: getLng(lng) })
    .addParagraph('PAGES.GENERAL_APPLICATION.GA_PAYMENT_SUCCESSFUL.WHAT_HAPPENS_NEXT_PARA_1', { lng: getLng(lng) })
    .addParagraph('PAGES.GENERAL_APPLICATION.GA_PAYMENT_SUCCESSFUL.WHAT_HAPPENS_NEXT_PARA_2', { lng: getLng(lng) })
    .addParagraph('PAGES.GENERAL_APPLICATION.GA_PAYMENT_SUCCESSFUL.WHAT_HAPPENS_NEXT_PARA_3', { lng: getLng(lng) })
    .addParagraph('PAGES.GENERAL_APPLICATION.GA_PAYMENT_SUCCESSFUL.WHAT_HAPPENS_NEXT_PARA_4', { lng: getLng(lng) })
    .addTitle('PAGES.GENERAL_APPLICATION.GA_PAYMENT_SUCCESSFUL.CHOOSEN_NOT_TO_INFORM_OTHER_PARTY',{ lng: getLng(lng) })
    .addParagraph('PAGES.GENERAL_APPLICATION.GA_PAYMENT_SUCCESSFUL.CHOOSEN_NOT_TO_INFORM_OTHER_PARTY_PARA_1', { lng: getLng(lng) })
    .addParagraph('PAGES.GENERAL_APPLICATION.GA_PAYMENT_SUCCESSFUL.CHOOSEN_NOT_TO_INFORM_OTHER_PARTY_PARA_2', { lng: getLng(lng) })
    .addTitle('PAGES.GENERAL_APPLICATION.GA_PAYMENT_SUCCESSFUL.PAYMENT_SUMMARY_TITLE',{ lng: getLng(lng) })
    .addSummary(currencyFormatWithNoTrailingZeros(convertToPoundsFilter(
      "400.01")),
    'COMMON.MICRO_TEXT.APPLICATION_FEE',lng)
    .build();
};

export const getGaPaymentSuccessfulButtonContent = (redirectUrl : string) => {
  return new PaymentSuccessfulSectionBuilder()
    .addButton('COMMON.BUTTONS.CLOSE_AND_RETURN_TO_DASHBOARD', redirectUrl)
    .build();
};



