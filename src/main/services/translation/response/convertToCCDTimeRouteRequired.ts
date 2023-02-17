import {PaymentOptionType} from 'form/models/admission/paymentOption/paymentOptionType';
import {CCDPaymentOption} from 'models/ccdResponse/ccdPaymentOption';

export const toCCDTimeRouteRequired = (option: PaymentOptionType): CCDPaymentOption => {
  switch(option) {
    case PaymentOptionType.IMMEDIATELY:
      return CCDPaymentOption.IMMEDIATELY;
    case PaymentOptionType.BY_SET_DATE:
      return CCDPaymentOption.BY_SET_DATE;
    case PaymentOptionType.INSTALMENTS:
      return CCDPaymentOption.REPAYMENT_PLAN;
  }
};
