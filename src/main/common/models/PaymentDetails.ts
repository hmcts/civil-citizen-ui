export class PaymentDetails {
  reference?: string;
  customerReference?: string;
  status?: PaymentStatus;
  errorCode?: string;
  errorMessage?: string;

  constructor(reference?: string, customerReference?: string, status?: PaymentStatus, errorCode?: string, errorMessage?: string) {
    this.reference = reference;
    this.customerReference = customerReference;
    this.status = status;
    this.errorCode = errorCode;
    this.errorMessage = errorMessage;
  }

}

export enum PaymentStatus {
  SUCCESS = 'SUCCESS',
  FAILED = 'FAILED'
}
