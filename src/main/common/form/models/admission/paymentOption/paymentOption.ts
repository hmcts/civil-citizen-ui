import {PaymentOptionType} from './paymentOptionType';
import {IsIn} from 'class-validator';

export class PaymentOption {
  @IsIn(Object.values(PaymentOptionType), {message: 'ERRORS.VALID_PAYMENT_OPTION'})
    paymentType: PaymentOptionType;
  totalClaimAmount?: number;

  constructor(paymentType?: PaymentOptionType, totalClaimAmount?: number) {
    this.paymentType = paymentType;
    this.totalClaimAmount = totalClaimAmount;
  }

  paymentOptionBySetDateSelected() {
    return this.paymentType && this.paymentType === PaymentOptionType.BY_SET_DATE;
  }

  paymentOptionByImmediately() {
    return this.paymentType && this.paymentType === PaymentOptionType.IMMEDIATELY;
  }
}
