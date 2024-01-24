import {Claim} from 'models/claim';
import {convertToPoundsFilter, currencyFormatWithNoTrailingZeros} from 'common/utils/currencyFormat';
import {PaymentSuccessfulSectionBuilder} from 'services/features/claim/paymentSuccessfulSectionBuilder';

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
      claim.claimFee.calculatedAmountInPence)),
      'COMMON.MICRO_TEXT.CLAIM_FEE')
    .build();
};

export const getPaymentSuccessfulButtonContent = (redirectUrl : string) => {
  return new PaymentSuccessfulSectionBuilder()
    .addButton('COMMON.BUTTONS.GO_TO_ACCOUNT', redirectUrl)
    .build();
};
