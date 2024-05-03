import {PaymentOptionType} from 'common/form/models/admission/paymentOption/paymentOptionType';
import {CCDClaimantPaymentOption} from 'models/ccdResponse/ccdClaimantPaymentOption';
import {ClaimantResponse} from 'models/claimantResponse';
import {convertDateToStringFormat} from 'common/utils/dateUtils';
import {RepaymentDecisionType} from 'models/claimantResponse/RepaymentDecisionType';

export const toCCDClaimantPaymentOption = (paymentOptionType: PaymentOptionType) : CCDClaimantPaymentOption => {
  switch (paymentOptionType) {
    case PaymentOptionType.INSTALMENTS:
      return CCDClaimantPaymentOption.REPAYMENT_PLAN;
    case PaymentOptionType.BY_SET_DATE:
      return CCDClaimantPaymentOption.SET_DATE;
    case PaymentOptionType.IMMEDIATELY:
      return CCDClaimantPaymentOption.IMMEDIATELY;
    default: return undefined;
  }
};

export const toCCDClaimantSuggestedPayByInstalments = (claimantResponse?: ClaimantResponse): boolean => {
  return claimantResponse?.suggestedPaymentIntention?.paymentOption === PaymentOptionType.INSTALMENTS;
};

export const toCCDClaimantSuggestedPayByDate = (claimantResponse?: ClaimantResponse): boolean => {
  return claimantResponse?.suggestedPaymentIntention?.paymentOption === PaymentOptionType.BY_SET_DATE;
};

export const toCCDClaimantSuggestedFirstRepaymentDate = (claimantResponse?: ClaimantResponse): string => {
  const firstRepaymentDate = claimantResponse?.suggestedPaymentIntention?.repaymentPlan?.firstRepaymentDate;

  if(toCCDClaimantSuggestedPayByInstalments(claimantResponse) && (firstRepaymentDate)) {
    return convertDateToStringFormat(firstRepaymentDate);
  }

  return undefined;
};

export const toCCDClaimantSuggestedImmediatePaymentDateInFavourClaimant = (claimantResponse?: ClaimantResponse): boolean => {
  return claimantResponse?.courtDecision === RepaymentDecisionType.IN_FAVOUR_OF_CLAIMANT &&
  claimantResponse?.suggestedPaymentIntention?.paymentOption === PaymentOptionType.IMMEDIATELY;
};

