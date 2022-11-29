import {DefendantDOB} from './defendantDOB';
import {CcjPaymentOption} from 'form/models/claimantResponse/ccj/ccjPaymentOption';
import {PaidAmount} from './paidAmount';

export class CCJRequest {
  defendantDOB?: DefendantDOB;
  ccjPaymentOption: CcjPaymentOption;
  paidAmount?: PaidAmount;
}
