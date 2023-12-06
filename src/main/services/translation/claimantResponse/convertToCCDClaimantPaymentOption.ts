import {PaymentOptionType} from 'common/form/models/admission/paymentOption/paymentOptionType';
import {ClaimantResponse} from 'common/models/claimantResponse';
import {CCDClaimantPaymentOption} from 'models/ccdResponse/ccdClaimantPaymentOption';

export const toCCDClaimantPaymentOption = (paymentOptionType: PaymentOptionType) : CCDClaimantPaymentOption => {
  switch(paymentOptionType) {
    case PaymentOptionType.INSTALMENTS:
      return CCDClaimantPaymentOption.REPAYMENT_PLAN;
    case PaymentOptionType.BY_SET_DATE:
      return CCDClaimantPaymentOption.SET_DATE;
    default: return CCDClaimantPaymentOption.IMMEDIATELY;
  }
};

export const toCCDClaimantSuggestedPayByInstalments = (claimantResponse?: ClaimantResponse): boolean => {
  return claimantResponse?.suggestedPaymentIntention?.paymentOption === PaymentOptionType.INSTALMENTS;
};

export const toCCDClaimantSuggestedPayByDate = (claimantResponse?: ClaimantResponse): boolean => {
  return claimantResponse?.suggestedPaymentIntention?.paymentOption === PaymentOptionType.BY_SET_DATE;
};