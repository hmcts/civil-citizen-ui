import {CcjPaymentOption} from 'common/form/models/claimantResponse/ccj/ccjPaymentOption';
import {QualifiedStatementOfTruth} from 'common/form/models/statementOfTruth/qualifiedStatementOfTruth';
import {DefendantDOB} from './defendantDOB';
import {PaidAmount} from './paidAmount';
import {PaymentDate} from 'form/models/admission/fullAdmission/paymentOption/paymentDate';
import {RepaymentPlanInstalments} from './repaymentPlanInstalments';
import {YesNo} from 'common/form/models/yesNo';
import {PaymentOptionType} from 'common/form/models/admission/paymentOption/paymentOptionType';

export class CCJRequest {
  defendantDOB?: DefendantDOB;
  statementOfTruth?: QualifiedStatementOfTruth;
  ccjPaymentOption?: CcjPaymentOption;
  paidAmount?: PaidAmount;
  defendantPaymentDate?: PaymentDate;
  repaymentPlanInstalments?: RepaymentPlanInstalments;

  isCCJCompleted(): boolean {
    return (
      //Date of birth compelted
      (this.defendantDOB?.option === YesNo.NO ||
        (this.defendantDOB?.option === YesNo.YES &&
          !!this.defendantDOB?.dob?.dateOfBirth)) &&
      //Paid amount compelted
      (this.paidAmount?.option === YesNo.NO ||
        (this.paidAmount?.option === YesNo.YES &&
          !!this.paidAmount?.amount)) &&
      //Payment options compelted
      (this.ccjPaymentOption?.type === PaymentOptionType.IMMEDIATELY ||
        (this.ccjPaymentOption?.type === PaymentOptionType.BY_SET_DATE &&
          !!this.defendantPaymentDate?.date) ||
        (this.ccjPaymentOption?.type === PaymentOptionType.INSTALMENTS &&
          !!this.repaymentPlanInstalments?.amount &&
          !!this.repaymentPlanInstalments?.firstPaymentDate?.date &&
          !!this.repaymentPlanInstalments?.paymentFrequency)) &&
      // Statement of truth compelted
      !!this.statementOfTruth
    );
  }
}
