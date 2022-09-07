import {CCDPaymentOption} from './ccdPaymentOption';
import {ClaimUpdate} from '../../models/events/eventDto';
import {CCDRepaymentPlan} from './ccdRepaymentPlan';

export interface CCDResponse extends ClaimUpdate{
  respondent1ClaimResponseTypeForSpec?: string;
  defenceAdmitPartPaymentTimeRouteRequired?: CCDPaymentOption;
  paymentTypeSelection?: CCDPaymentOption;
  respondent1RepaymentPlan?: CCDRepaymentPlan;
  paymentSetDate?: string;
}
