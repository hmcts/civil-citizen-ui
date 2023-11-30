import {PaymentOptionType} from 'common/form/models/admission/paymentOption/paymentOptionType';
import {ClaimantResponse} from 'models/claimantResponse';

export const toCCDClaimantSuggestedPayByInstalments= (claimantResponse?: ClaimantResponse) : boolean => {
 return claimantResponse?.suggestedPaymentIntention?.paymentOption === PaymentOptionType.INSTALMENTS;
};

export const toCCDClaimantSuggestedPayByDate= (claimantResponse?: ClaimantResponse) : boolean => {
  return claimantResponse?.suggestedPaymentIntention?.paymentOption === PaymentOptionType.BY_SET_DATE;
};

