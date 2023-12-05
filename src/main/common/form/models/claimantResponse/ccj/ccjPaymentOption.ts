import {PaymentOptionType} from '../../admission/paymentOption/paymentOptionType';
import {IsIn} from 'class-validator';

export class CcjPaymentOption {
  @IsIn(Object.values(PaymentOptionType), {message: 'ERRORS.VALID_CCJ_PAYMENT_OPTION'})
    type: PaymentOptionType;

  constructor(type?: PaymentOptionType) {
    this.type = type;
  }

  isCcjPaymentOptionBySetDate() {
    return this.type === PaymentOptionType.BY_SET_DATE;
  }

  isCcjPaymentOptionInstalments() {
    return this.type === PaymentOptionType.INSTALMENTS;
  }

  isCcjPaymentOptionImmediately() {
    return this.type === PaymentOptionType.IMMEDIATELY;
  }

}
