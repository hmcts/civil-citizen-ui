import {PaymentOptionType} from 'common/form/models/admission/paymentOption/paymentOptionType';
import {CCDDJPaymentOption} from 'models/ccdResponse/ccdDJPaymentOption';

export const toCCDDJPaymentOption = (paymentOptionType: PaymentOptionType) : CCDDJPaymentOption => {
  switch(paymentOptionType) {
    case PaymentOptionType.INSTALMENTS:
      return CCDDJPaymentOption.REPAYMENT_PLAN;
    case PaymentOptionType.BY_SET_DATE:
      return CCDDJPaymentOption.SET_DATE;
    default: return CCDDJPaymentOption.IMMEDIATELY;
  }
};
