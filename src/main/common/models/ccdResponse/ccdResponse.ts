import {CCDPaymentOption} from './ccdPaymentOption';
import {ClaimUpdate} from '../../models/events/eventDto';
import {Respondent} from '../../models/respondent';
import {CCDRepaymentPlan} from './ccdRepaymentPlan';

export interface CCDResponse extends ClaimUpdate{
  respondent1?: Respondent
  paymentTypeSelection?: CCDPaymentOption;
  respondent1RepaymentPlan?: CCDRepaymentPlan;
  repaymentDate?: Date;
}
