import {CCDPaymentOption} from './ccdPaymentOption';
import {ClaimUpdate} from '../../models/events/eventDto';
import {CCDRepaymentPlan} from './ccdRepaymentPlan';
import {CCDPayBySetDate} from './ccdPayBySetDate';
import {YesNoUpperCamelCase} from '../../../common/form/models/yesNo';
import {CCDParty} from './ccdParty';
import {CCDBankAccount} from "models/ccdResponse/ccdBankAccount";
import {CCDHomeDetails} from "models/ccdResponse/ccdHomeDetails";
import {CCDPartnerAndDependent} from "models/ccdResponse/ccdPartnerAndDependent";
import {CCDUnemploymentDetails} from "models/ccdResponse/ccdUnemploymentDetails";
import {CCDEmployerDetails} from "models/ccdResponse/ccdEmployerDetails";
import {CCDSelfEmploymentDetails} from "models/ccdResponse/ccdSelfEmploymentDetails";
import {CCDCourtOrders} from "models/ccdResponse/ccdCourtOrders";

export interface CCDResponse extends ClaimUpdate {
  respondent1ClaimResponseTypeForSpec: string;
  defenceAdmitPartPaymentTimeRouteRequired?: CCDPaymentOption;
  respondent1RepaymentPlan?: CCDRepaymentPlan;
  respondToClaimAdmitPartLRspec?: CCDPayBySetDate;
  responseClaimMediationSpecRequired?: string;
  specAoSApplicantCorrespondenceAddressRequired?: YesNoUpperCamelCase;
  totalClaimAmount: number,
  respondent1: CCDParty;
  respondent1BankAccountList?: CCDBankAccount[];
  respondent1DQHomeDetails?: CCDHomeDetails;
  respondent1PartnerAndDependent?: CCDPartnerAndDependent;
  defenceAdmitPartEmploymentTypeRequired?: YesNoUpperCamelCase;
  respondToClaimAdmitPartEmploymentTypeLRspec?: string[];
  responseClaimAdmitPartEmployer?: CCDEmployerDetails;
  specDefendant1SelfEmploymentDetails?: CCDSelfEmploymentDetails;
  respondToClaimAdmitPartUnemployedLRspec?: CCDUnemploymentDetails;
  respondent1CourtOrderPaymentOption?: YesNoUpperCamelCase;
  respondent1CourtOrderDetails?: CCDCourtOrders[];
}
