import {PaymentOptionType} from '../../form/models/admission/paymentOption/paymentOptionType';

export enum CCDPaymentOption {
  IMMEDIATELY = 'IMMEDIATELY',
  BY_SET_DATE = 'BY_SET_DATE',
  REPAYMENT_PLAN = 'SUGGESTION_OF_REPAYMENT_PLAN'
}

export const toCCDPaymentOption = (paymentOptionType: PaymentOptionType) : CCDPaymentOption => {
  switch(paymentOptionType) {
    case PaymentOptionType.INSTALMENTS:
      return CCDPaymentOption.REPAYMENT_PLAN;
    case PaymentOptionType.BY_SET_DATE:
      return CCDPaymentOption.BY_SET_DATE;
    default: return CCDPaymentOption.IMMEDIATELY;
  }
};
