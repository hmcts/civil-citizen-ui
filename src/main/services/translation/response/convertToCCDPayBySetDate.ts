import {CCDClaimantPayBySetDate, CCDPayBySetDate} from 'models/ccdResponse/ccdPayBySetDate';
import {PaymentOptionType} from 'form/models/admission/paymentOption/paymentOptionType';

export const toCCDPayBySetDate = (paymentDate: Date, paymentOption: PaymentOptionType | undefined, respondentPaymentDeadline: Date): CCDPayBySetDate => {
  if(paymentOption === PaymentOptionType.IMMEDIATELY) {
    return  {
      whenWillThisAmountBePaid: respondentPaymentDeadline,
    };
  }
  else {
    return {
      whenWillThisAmountBePaid: paymentDate,
    };
  }
};

export const toCCDClaimantPayBySetDate = (paymentDate: Date): CCDClaimantPayBySetDate => {
  return {
    paymentSetDate: paymentDate,
  };
};

