
export class PaymentInformation {
  externalReference?: string;
  paymentReference?: string;
  status?: string;
  nextUrl?: string;
  dateCreated?: string;

  constructor(externalReference?: string, paymentReference?: string, status?: string, nextUrl?: string, dateCreated?: string) {
    this.externalReference = externalReference;
    this.paymentReference = paymentReference;
    this.status = status;
    this.nextUrl = nextUrl;
    this.dateCreated = dateCreated;
  }

}
