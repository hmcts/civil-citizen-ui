import { PaymentInformation } from '../feePayment/paymentInformation';

export interface ccdGAPBADetails {
  paymentDetails? : PaymentInformation;
  serviceReqReference? : string;
  additionalPaymentServiceRef? : string;
}
