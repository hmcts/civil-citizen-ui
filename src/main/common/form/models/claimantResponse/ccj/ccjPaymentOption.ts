import {PaymentOptionType} from '../../admission/paymentOption/paymentOptionType';
import {IsIn} from 'class-validator';

export class CcjPaymentOption {
  @IsIn(Object.values(PaymentOptionType), {message: 'ERRORS.VALID_CCJ_PAYMENT_OPTION'})
  paymentType: PaymentOptionType;

  constructor(paymentType?: PaymentOptionType) {
    this.paymentType = paymentType;
  }
}
