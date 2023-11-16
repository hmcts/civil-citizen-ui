import {PaymentOptionType} from 'common/form/models/admission/paymentOption/paymentOptionType';
import {CCDClaimantPaymentOption} from "models/ccdResponse/ccdClaimantPaymentOption";

export const toCCDClaimantPaymentOption = (paymentOptionType: PaymentOptionType) : CCDClaimantPaymentOption => {
  switch(paymentOptionType) {
    case PaymentOptionType.INSTALMENTS:
      return CCDClaimantPaymentOption.REPAYMENT_PLAN;
    case PaymentOptionType.BY_SET_DATE:
      return CCDClaimantPaymentOption.SET_DATE;
    default: return CCDClaimantPaymentOption.IMMEDIATELY;
  }
};
