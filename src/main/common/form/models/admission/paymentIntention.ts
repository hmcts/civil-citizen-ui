import PaymentOptionType from './paymentOption/paymentOptionType';

export class PaymentIntention {
  paymentOption?: PaymentOptionType;
  paymentDate?: Date;
}
