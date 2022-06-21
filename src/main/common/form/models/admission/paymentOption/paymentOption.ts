import PaymentOptionType from './paymentOptionType';
import {VALID_PAYMENT_OPTION} from '../../../validationErrors/errorMessageConstants';
import {IsIn} from 'class-validator';

export default class PaymentOption {
  @IsIn(Object.values(PaymentOptionType), {message: VALID_PAYMENT_OPTION})
    paymentType: PaymentOptionType;

  constructor(paymentType?: PaymentOptionType) {
    this.paymentType = paymentType;
  }

  paymentOptionBySetDateSelected() {
    return this.paymentType && this.paymentType === PaymentOptionType.BY_SET_DATE;
  }
}
