import {CCDPaymentOption} from './ccdPaymentOption';
import {ClaimUpdate} from '../../models/events/eventDto';
import {CCDRepaymentPlan} from './ccdRepaymentPlan';
import {CCDPayBySetDate} from './ccdPayBySetDate';
import {YesNoUpperCase} from '../../../common/form/models/yesNo';
import {CCDParty} from './ccdParty';

export interface CCDResponse extends ClaimUpdate {
  respondent1ClaimResponseTypeForSpec: string; // TODO: should be ResponseType?
  defenceAdmitPartPaymentTimeRouteRequired?: CCDPaymentOption;
  respondent1RepaymentPlan?: CCDRepaymentPlan;
  respondToClaimAdmitPartLRspec?: CCDPayBySetDate;
  responseClaimMediationSpecRequired?: string;
  specAoSApplicantCorrespondenceAddressRequired?: YesNoUpperCase;
  totalClaimAmount: number,
  respondent1: CCDParty;
};
