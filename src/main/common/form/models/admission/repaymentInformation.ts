import {PaymentIntention} from 'form/models/admission/paymentIntention';
import {PaymentOptionType} from 'form/models/admission/paymentOption/paymentOptionType';
import {RepaymentPlanSummary} from 'form/models/admission/repaymentPlanSummary';

export class RepaymentInformation {
    paymentIntention?: PaymentIntention;
    paymentOption?: PaymentOptionType;
    paymentDate?: string;
    repaymentPlan?: RepaymentPlanSummary;
}
