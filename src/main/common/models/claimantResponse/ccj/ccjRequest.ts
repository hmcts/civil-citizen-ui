import {DefendantDOB} from './defendantDOB';

export class CCJRequest {
  defendantDOB?: DefendantDOB;
  statementOfTruth?: QualifiedStatementOfTruth;
  ccjPaymentOption: CcjPaymentOption;
  paidAmount?: PaidAmount;
  defendantPaymentDate?: PaymentDate;
}
