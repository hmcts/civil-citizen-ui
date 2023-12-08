import {CCDClaimantPayBySetDate, CCDPayBySetDate} from 'models/ccdResponse/ccdPayBySetDate';
import {PaymentOptionType} from 'form/models/admission/paymentOption/paymentOptionType';
import {PaymentDate} from 'common/form/models/admission/fullAdmission/paymentOption/paymentDate';
import {convertDateToStringFormat} from 'common/utils/dateUtils';

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
    paymentSetDate: convertDateToStringFormat(((paymentDate as unknown as PaymentDate).date)),
  };
};
