import {PaymentOptionType} from './paymentOptionType';
import {IsIn} from 'class-validator';

export class PaymentOption {
  @IsIn(Object.values(PaymentOptionType), {message: 'ERRORS.VALID_PAYMENT_OPTION'})
    paymentType: PaymentOptionType;

  constructor(paymentType?: PaymentOptionType) {
    this.paymentType = paymentType;
  }

  paymentOptionBySetDateSelected() {
    return this.paymentType && this.paymentType === PaymentOptionType.BY_SET_DATE;
  }

  paymentOptionByImmediately() {
    return this.paymentType && this.paymentType === PaymentOptionType.IMMEDIATELY;
  }
}
