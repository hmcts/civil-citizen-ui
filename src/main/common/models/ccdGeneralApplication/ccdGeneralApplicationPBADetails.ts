export interface CcdGeneralApplicationPBADetails {
  fee: CcdFee,
  paymentDetails: CcdPaymentDetails,
  additionalPaymentDetails?: CcdPaymentDetails,
  serviceRequestReference: string,
}

export interface CcdFee {
  code: string,
  version: string,
  calculatedAmountInPence: string,
}

export interface CcdPaymentDetails {
  status: string,
  reference: string,
}
