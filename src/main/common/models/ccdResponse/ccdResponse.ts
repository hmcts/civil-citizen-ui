import {CCDPaymentOption} from './ccdPaymentOption';
import {ClaimUpdate} from '../../models/events/eventDto';
import {CCDRepaymentPlan} from './ccdRepaymentPlan';
import {CCDPayBySetDate} from './ccdPayBySetDate';
import {YesNoUpperCamelCase} from '../../../common/form/models/yesNo';
import {CCDParty} from './ccdParty';
import {CCDTimeLineOfEvents} from './ccdTimeLineOfEvents';
import {AdmittedClaim} from './ccdAdittedClaim';
import {CCDHomeType} from './ccdHomeType';
import { CCDBankAccount } from './ccdBankAccount';
import { CCDPartnerAndDependent } from './ccdPartnerAndDependent';
import { CCDSelfEmploymentDetails } from './ccdSelfEmploymentDetails';
import { CCDUnemployedDetails } from './ccdUnemployedDetails';
import { CCDEmploymentType } from './ccdEmploymentType';
import { CCDEmployerDetails } from './ccdEmployerDetails';
import { CCDCourtOrderDetails } from './ccdCourtOrderDetails';
import { CCDLoanCreditDetails } from './ccdLoanCreditDetails';

export interface CCDResponse extends ClaimUpdate {
  respondent1ClaimResponseTypeForSpec: string; // TODO: should be ResponseType?
  defenceAdmitPartPaymentTimeRouteRequired?: CCDPaymentOption;
  respondent1RepaymentPlan?: CCDRepaymentPlan;
  respondToClaimAdmitPartLRspec?: CCDPayBySetDate;
  responseClaimMediationSpecRequired?: string;
  specAoSApplicantCorrespondenceAddressRequired?: YesNoUpperCamelCase;
  totalClaimAmount: number,
  respondent1: CCDParty;
  respondent1Represented: string,
  specDefenceAdmittedRequired: string; // TODO: YES NO;
  respondToAdmittedClaim: AdmittedClaim;
  detailsOfWhyDoesYouDisputeTheClaim: string,
  specResponseTimelineOfEvents: CCDTimeLineOfEvents[],
  respondToAdmittedClaimOwingAmount: number,
  disabilityPremiumPayments: string; // TODO: YES NO;
  severeDisabilityPremiumPayments: string; // TODO: YES NO;
  respondent1DQ: {
    respondent1DQCarerAllowanceCredit: string, // TODO: YES NO;
    respondent1BankAccountList: CCDBankAccount[],
    respondent1DQHomeDetails: {
      type: CCDHomeType,
      typeOtherDetails: string,
    },
  },
  responseToClaimAdmitPartWhyNotPayLRspec: string, // TODO: YES NO;
  respondent1LoanCreditOption: string, // TODO: YES NO;
  respondent1CourtOrderPaymentOption: string, // TODO: YES NO;
  respondent1PartnerAndDependent: CCDPartnerAndDependent;
  defenceAdmitPartEmploymentTypeRequired: string,  // TODO: YES NO;
  specDefendant1SelfEmploymentDetails: CCDSelfEmploymentDetails,
  respondToClaimAdmitPartUnemployedLRspec: CCDUnemployedDetails,
  respondToClaimAdmitPartEmploymentTypeLRspec: CCDEmploymentType[],
  responseClaimAdmitPartEmployer: {
    employerDetails: CCDEmployerDetails[],
  },
  respondent1CourtOrderDetails: CCDCourtOrderDetails[],
  respondent1LoanCreditDetails: CCDLoanCreditDetails[],
}
