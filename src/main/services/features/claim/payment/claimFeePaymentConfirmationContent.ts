import {Claim} from 'models/claim';
import {PaymentSuccessfulSectionBuilder} from 'services/features/claim/payment/claimFeePaymentSuccessfulSectionBuilder';
import {convertToPoundsFilter, currencyFormatWithNoTrailingZeros} from 'common/utils/currencyFormat';
import {PaymentUnsuccessfulSectionBuilder} from 'services/features/claim/payment/claimFeePaymentUnsuccessfulSectionBuilder';

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

export const getPaymentUnsuccessfulBodyContent = (claim : Claim, lng : string, claimId: string) => {
  const callChargesLink = 'https://www.gov.uk/call-charges';
  const callCharges = 'www.gov.uk/call-charges';
  const phoneNumber = '0300 123 7050';
  return new PaymentUnsuccessfulSectionBuilder()
    .addMainTitle('PAGES.PAYMENT_CONFIRMATION.UNSUCCESSFUL.PAGE_TITLE', { lng })
    .addParagraph('PAGES.PAYMENT_CONFIRMATION.UNSUCCESSFUL.CLAIM_NUMBER', { claimId: claimId, lng })
    .addParagraph('PAGES.PAYMENT_CONFIRMATION.UNSUCCESSFUL.CLAIMANT_V_DEFENDANT', {claimantName: claim.getClaimantFullName(), defendantName: claim.getDefendantFullName(), lng })
    .addParagraph('PAGES.PAYMENT_CONFIRMATION.UNSUCCESSFUL.NO_MONEY_TAKEN', { lng })
    .addLink(
      'PAGES.PAYMENT_CONFIRMATION.UNSUCCESSFUL.TRY_PAYMENT_AGAIN',
      claim?.claimDetails?.claimFeePayment?.nextUrl,
      'PAGES.PAYMENT_CONFIRMATION.UNSUCCESSFUL.GO_BACK',
      '.',
      { lng })
    .addPhoneNumber(lng, phoneNumber)
    .addTitle('PAGES.PAYMENT_CONFIRMATION.UNSUCCESSFUL.OPEN_TIMES', { lng })
    .addParagraph('COMMON.CONTACT_US_FOR_HELP.OPENING_HOURS', { lng })
    .addLink(
      callCharges, callChargesLink,
      'PAGES.PAYMENT_CONFIRMATION.UNSUCCESSFUL.FIND_OUT_CHARGES',
      '.',
      { lng })
    .build();
};
