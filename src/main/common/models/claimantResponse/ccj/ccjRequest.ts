import {CcjPaymentOption} from 'common/form/models/claimantResponse/ccj/ccjPaymentOption';
import {QualifiedStatementOfTruth} from 'common/form/models/statementOfTruth/qualifiedStatementOfTruth';
import {DefendantDOB} from './defendantDOB';
import {PaidAmount} from './paidAmount';
import {PaymentDate} from 'form/models/admission/fullAdmission/paymentOption/paymentDate';
import {RepaymentPlanInstalments} from './repaymentPlanInstalments';
import {DefendantFinalPaymentDate} from 'form/models/certOfSorC/defendantFinalPaymentDate';

export class CCJRequest {
  defendantDOB?: DefendantDOB;
  statementOfTruth?: QualifiedStatementOfTruth;
  ccjPaymentOption?: CcjPaymentOption;
  paidAmount?: PaidAmount;
  defendantPaymentDate?: PaymentDate;
  repaymentPlanInstalments?: RepaymentPlanInstalments;
  defendantFinalPaymentDate?: DefendantFinalPaymentDate;

}
