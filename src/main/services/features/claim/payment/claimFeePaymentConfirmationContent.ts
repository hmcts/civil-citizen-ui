import {Claim} from 'models/claim';
import {PaymentSuccessfulSectionBuilder} from 'services/features/claim/payment/claimFeePaymentSuccessfulSectionBuilder';
import {convertToPoundsFilter, currencyFormatWithNoTrailingZeros} from 'common/utils/currencyFormat';
import {PaymentUnsuccessfulSectionBuilder} from 'services/features/claim/payment/claimFeePaymentUnsuccessfulSectionBuilder';
import {t} from 'i18next';

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

export const getPaymentUnsuccessfulBodyContent = (claim : Claim, lang : string, claimId: string) => {
  const callChargesLink = 'https://www.gov.uk/call-charges';
  const callCharges = 'www.gov.uk/call-charges';
  return new PaymentUnsuccessfulSectionBuilder()

    .addMainTitle(t('PAGES.PAYMENT_CONFIRMATION.UNSUCCESSFUL.PAGE_TITLE', {lng: lang}))
    .addParagraph(t('PAGES.PAYMENT_CONFIRMATION.UNSUCCESSFUL.CLAIM_NUMBER', {claimNumber: claimId, lng: lang}))
    .addParagraph(t('PAGES.PAYMENT_CONFIRMATION.UNSUCCESSFUL.CLAIMANT_V_DEFENDANT', {claimantName: claim.getClaimantFullName(), defendantName: claim.getDefendantFullName(),lng: lang}))
    .addParagraph(t('PAGES.PAYMENT_CONFIRMATION.UNSUCCESSFUL.NO_MONEY_TAKEN', {lng: lang}))
    .addLink(
      t('PAGES.PAYMENT_CONFIRMATION.UNSUCCESSFUL.TRY_PAYMENT_AGAIN', {lng: lang}),
      claim?.claimDetails?.claimFeePayment?.nextUrl,
      t('PAGES.PAYMENT_CONFIRMATION.UNSUCCESSFUL.GO_BACK', {lng: lang}),
      t('PAGES.PAYMENT_CONFIRMATION.UNSUCCESSFUL.FULL_STOP', {lng: lang}))
    .addPhoneNumber(lang)
    .addTitle(t('PAGES.PAYMENT_CONFIRMATION.UNSUCCESSFUL.OPEN_TIMES', {lng: lang}))
    .addParagraph(t('COMMON.CONTACT_US_FOR_HELP.OPENING_HOURS', {lng: lang}))
    .addLink(
      callCharges, callChargesLink,
      t('PAGES.PAYMENT_CONFIRMATION.UNSUCCESSFUL.FIND_OUT_CHARGES', {lng: lang}),
      t('PAGES.PAYMENT_CONFIRMATION.UNSUCCESSFUL.FULL_STOP', {lng: lang}))
    .build();
};
