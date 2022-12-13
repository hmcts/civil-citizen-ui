import {DefendantDOB} from './defendantDOB';
import {CcjPaymentOption} from 'form/models/claimantResponse/ccj/ccjPaymentOption';
import {PaidAmount} from './paidAmount';
import {PaymentDate} from 'form/models/admission/fullAdmission/paymentOption/paymentDate';

export class CCJRequest {
  defendantDOB?: DefendantDOB;
  ccjPaymentOption: CcjPaymentOption;
  paidAmount?: PaidAmount;
  defendantPaymentDate?: PaymentDate;
}
