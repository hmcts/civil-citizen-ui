import { PaymentInformation } from "../feePayment/paymentInformation";

export interface ccdGAPbaDetails {
  paymentDetails? : PaymentInformation;
  serviceReqReference? : string;
  additionalPaymentServiceRef? : string;
}
