
export class PaymentInformation {
  externalReference?: string;
  paymentReference?: string;
  status?: string;
  nextUrl?: string;
  dateCreated?: string;
  errorCode?: string;
  errorDescription?: string;

  constructor(externalReference?: string, paymentReference?: string, status?: string, nextUrl?: string, dateCreated?: string, errorCode?: string, errorDescription?: string) {
    this.externalReference = externalReference;
    this.paymentReference = paymentReference;
    this.status = status;
    this.nextUrl = nextUrl;
    this.dateCreated = dateCreated;
    this.errorCode = errorCode;
    this.errorDescription = errorDescription;
  }

}
