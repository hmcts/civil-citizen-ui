import {CCDPaymentOption} from './ccdPaymentOption';
import {ClaimUpdate} from 'models/events/eventDto';
import {CCDRepaymentPlan} from './ccdRepaymentPlan';
import {CCDPayBySetDate} from './ccdPayBySetDate';
import {YesNoUpperCamelCase} from 'common/form/models/yesNo';
import {CCDParty} from './ccdParty';

export interface CCDResponse extends ClaimUpdate {
  respondent1ClaimResponseTypeForSpec: string;
  defenceAdmitPartPaymentTimeRouteRequired?: CCDPaymentOption;
  respondent1RepaymentPlan?: CCDRepaymentPlan;
  respondToClaimAdmitPartLRspec?: CCDPayBySetDate;
  responseClaimMediationSpecRequired?: string;
  specAoSApplicantCorrespondenceAddressRequired?: YesNoUpperCamelCase;
  totalClaimAmount: number,
  respondent1: CCDParty;
}
