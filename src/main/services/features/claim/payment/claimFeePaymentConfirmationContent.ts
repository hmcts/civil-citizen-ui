import {Claim} from 'models/claim';
import {PaymentSuccessfulSectionBuilder} from 'services/features/claim/payment/claimFeePaymentSuccessfulSectionBuilder';
import {convertToPoundsFilter, currencyFormatWithNoTrailingZeros} from 'common/utils/currencyFormat';

export const getPaymentSuccessfulPanelContent = (claim : Claim) => {
  return new PaymentSuccessfulSectionBuilder()
    .addPanel(claim.claimDetails?.claimFeePayment?.paymentReference)
    .build();
};

export const getPaymentSuccessfulBodyContent = (claim : Claim) => {
  return new PaymentSuccessfulSectionBuilder()
    .addParagraph('PAGES.PAYMENT_CONFIRMATION.SUCCESSFUL.CONFIRMATION')
    .addTitle('PAGES.PAYMENT_CONFIRMATION.SUCCESSFUL.PAYMENT_SUMMARY')
    .addSummary(currencyFormatWithNoTrailingZeros(convertToPoundsFilter(
      claim.claimFee.calculatedAmountInPence)))
    .build();
};

export const getPaymentSuccessfulButtonContent = (redirectUrl : string) => {
  return new PaymentSuccessfulSectionBuilder()
    .addButton('COMMON.BUTTONS.GO_TO_ACCOUNT', redirectUrl)
    .build();
};
