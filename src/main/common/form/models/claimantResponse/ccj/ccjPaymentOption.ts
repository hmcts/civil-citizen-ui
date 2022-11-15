import {PaymentOptionType} from '../../admission/paymentOption/paymentOptionType';
import {IsIn} from 'class-validator';

export class CcjPaymentOption {
  @IsIn(Object.values(PaymentOptionType), {message: 'ERRORS.VALID_CCJ_PAYMENT_OPTION'})
    type: PaymentOptionType;

  constructor(type?: PaymentOptionType) {
    this.type = type;
  }
}
