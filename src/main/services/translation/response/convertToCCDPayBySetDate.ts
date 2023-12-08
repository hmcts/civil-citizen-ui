import {CCDClaimantPayBySetDate, CCDPayBySetDate} from 'models/ccdResponse/ccdPayBySetDate';
import {PaymentOptionType} from 'form/models/admission/paymentOption/paymentOptionType';
import {PaymentDate} from 'common/form/models/admission/fullAdmission/paymentOption/paymentDate';
import {DateTime} from 'luxon';

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
    paymentSetDate: DateTime.fromJSDate(new Date((paymentDate as unknown as PaymentDate).date)).toFormat('yyyy-MM-dd'),
  };
};
