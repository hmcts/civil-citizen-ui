import PaymentOptionType from '../../../models/admission/paymentOption/paymentOptionType';

export class PaymentIntention {
  paymentOption?: PaymentOptionType;
  paymentDate?: Date;
}
