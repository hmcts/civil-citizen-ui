import PaymentOptionType from './paymentOptionType';
import paymentOptionType from './paymentOptionType';
import {VALID_PAYMENT_OPTION} from '../../../../validationErrors/errorMessageConstants';
import {IsIn} from 'class-validator';

export default class PaymentOption {
  @IsIn(Object.values(PaymentOption), {message: VALID_PAYMENT_OPTION})
    paymentType: PaymentOptionType;

  constructor(paymentType?: paymentOptionType) {
    this.paymentType = paymentType;
  }
}
