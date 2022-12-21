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

  formatOptionType(type: PaymentOptionType) {
    if(type === PaymentOptionType.INSTALMENTS) {
      return 'By instalments';
    }else if(type === PaymentOptionType.BY_SET_DATE){
      return 'By a set date';
    }else if(type === PaymentOptionType.IMMEDIATELY){
      return 'Immediately';
    }
  }
}
