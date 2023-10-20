import {RepaymentPlan} from '../../../../common/models/repaymentPlan';
import { PaymentOptionType } from '../../models/admission/paymentOption/paymentOptionType';

export class PaymentIntention {
  paymentOption?: PaymentOptionType;
  paymentDate?: Date;
  repaymentPlan?: RepaymentPlan;
}
