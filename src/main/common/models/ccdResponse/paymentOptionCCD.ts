import PaymentOptionType from '../../form/models/admission/paymentOption/paymentOptionType';

export enum PaymentOptionCCD {
  IMMEDIATELY = 'IMMEDIATELY',
  SET_DATE = 'SET_DATE',
  REPAYMENT_PLAN = 'REPAYMENT_PLAN'
}

export const toCCDPaymentOption = (paymentOptionType: PaymentOptionType) : PaymentOptionCCD => {
  switch(paymentOptionType) {
    case PaymentOptionType.INSTALMENTS:
      return PaymentOptionCCD.REPAYMENT_PLAN;
    case PaymentOptionType.BY_SET_DATE:
      return PaymentOptionCCD.SET_DATE;
    default: return PaymentOptionCCD.IMMEDIATELY;
  }
};
