import {PaymentOptionType} from 'common/form/models/admission/paymentOption/paymentOptionType';
import {CCDPaymentOption} from 'common/models/ccdResponse/ccdPaymentOption';

export const toCCDPaymentOption = (paymentOptionType: PaymentOptionType) : CCDPaymentOption => {
  switch(paymentOptionType) {
    case PaymentOptionType.INSTALMENTS:
      return CCDPaymentOption.REPAYMENT_PLAN;
    case PaymentOptionType.BY_SET_DATE:
      return CCDPaymentOption.BY_SET_DATE;
    default: return CCDPaymentOption.IMMEDIATELY;
  }
};
