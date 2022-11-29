import {DefendantDOB} from './defendantDOB';
import {CcjPaymentOption} from 'form/models/claimantResponse/ccj/ccjPaymentOption';

export class CCJRequest {
  defendantDOB?: DefendantDOB;
  ccjPaymentOption: CcjPaymentOption;
}
