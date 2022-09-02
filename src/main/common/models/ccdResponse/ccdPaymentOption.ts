import PaymentOptionType from '../../form/models/admission/paymentOption/paymentOptionType';

export enum CCDPaymentOption {
  IMMEDIATELY = 'IMMEDIATELY',
  SET_DATE = 'SET_DATE',
  REPAYMENT_PLAN = 'REPAYMENT_PLAN'
}

export const toCCDPaymentOption = (paymentOptionType: PaymentOptionType) : CCDPaymentOption => {
  switch(paymentOptionType) {
    case PaymentOptionType.INSTALMENTS:
      return CCDPaymentOption.REPAYMENT_PLAN;
    case PaymentOptionType.BY_SET_DATE:
      return CCDPaymentOption.SET_DATE;
    default: return CCDPaymentOption.IMMEDIATELY;
  }
};
