import {Claim} from "models/claim";
import {PaymentSuccessfulSectionBuilder} from "services/features/claim/paymentSuccessfulSectionBuilder";

export const getPaymentSuccessfulPanelContent = (claim : Claim) => {
  return new PaymentSuccessfulSectionBuilder()
    //.addPanel(claim.caseProgression?.hearing?.paymentInformation?.paymentReference)
    .addPanel('12345678910')
    .build();
}


export const getPaymentSuccessfulBodyContent = (claim : Claim) => {
  return new PaymentSuccessfulSectionBuilder()
    .addParagraph('You\'ll receive a confirmation email in the next hour')
    .addTitle('Payment Summary')
    .addSummary('Hearing fee', '70$')
    .build();
}

export const getPaymentSuccessfulButtonContent = (claim : Claim) => {
  return new PaymentSuccessfulSectionBuilder()
    .addButton('Close and return to case overview', '#')
    .build();
}
