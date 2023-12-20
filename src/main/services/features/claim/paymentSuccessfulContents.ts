import {Claim} from "models/claim";
import {PaymentSuccessfulSectionBuilder} from "services/features/claim/paymentSuccessfulSectionBuilder";

export const getPaymentSuccessfulPanelContent = (claim : Claim) => {
  return new PaymentSuccessfulSectionBuilder()
    .addPanel()
    .build();
}
