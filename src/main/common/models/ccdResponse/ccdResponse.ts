import {CCDPaymentOption} from './ccdPaymentOption';
import {ClaimUpdate} from 'models/events/eventDto';
import {CCDRepaymentPlan} from './ccdRepaymentPlan';
import {CCDPayBySetDate} from './ccdPayBySetDate';
import {YesNoUpperCamelCase} from 'common/form/models/yesNo';
import {CCDParty} from './ccdParty';
import {CCDRespondToClaim} from "models/ccdResponse/ccdRespondToClaim";
import {CCDBankAccount} from 'models/ccdResponse/ccdBankAccount';
import {CCDHomeDetails} from 'models/ccdResponse/ccdHomeDetails';
import {CCDPartnerAndDependent} from 'models/ccdResponse/ccdPartnerAndDependent';
import {CCDUnemploymentDetails} from 'models/ccdResponse/ccdUnemploymentDetails';
import {CCDEmployerDetails} from 'models/ccdResponse/ccdEmployerDetails';
import {CCDSelfEmploymentDetails} from 'models/ccdResponse/ccdSelfEmploymentDetails';
import {CCDCourtOrders} from 'models/ccdResponse/ccdCourtOrders';
import {CCDLoanCredit} from 'models/ccdResponse/ccdLoanCredit';
import {CCDDebtDetails} from 'models/ccdResponse/ccdDebtDetails';
import {CCDRecurringIncome} from 'models/ccdResponse/ccdRecurringIncome';
import {CCDRecurringExpenses} from 'models/ccdResponse/ccdRecurringExpenses';
import {CCDRespondentLiPResponse} from 'models/ccdResponse/ccdRespondentLiPResponse';

export interface CCDResponse extends ClaimUpdate {
  respondent1ClaimResponseTypeForSpec: string;
  defenceAdmitPartPaymentTimeRouteRequired?: CCDPaymentOption;
  respondent1RepaymentPlan?: CCDRepaymentPlan;
  respondToClaimAdmitPartLRspec?: CCDPayBySetDate;
  responseClaimMediationSpecRequired?: string;
  specAoSApplicantCorrespondenceAddressRequired?: YesNoUpperCamelCase;
  totalClaimAmount: number,
  respondent1: CCDParty;
  defenceRouteRequired: string;
  respondToClaim: CCDRespondToClaim;
  detailsOfWhyDoesYouDisputeTheClaim: string;
  respondent1BankAccountList?: CCDBankAccount[];
  disabilityPremiumPayments?: YesNoUpperCamelCase;
  severeDisabilityPremiumPayments?: YesNoUpperCamelCase;
  respondent1DQHomeDetails?: CCDHomeDetails;
  respondent1PartnerAndDependent?: CCDPartnerAndDependent;
  defenceAdmitPartEmploymentTypeRequired?: YesNoUpperCamelCase;
  respondToClaimAdmitPartEmploymentTypeLRspec?: string[];
  responseClaimAdmitPartEmployer?: CCDEmployerDetails;
  specDefendant1SelfEmploymentDetails?: CCDSelfEmploymentDetails;
  respondToClaimAdmitPartUnemployedLRspec?: CCDUnemploymentDetails;
  respondent1CourtOrderPaymentOption?: YesNoUpperCamelCase;
  respondent1CourtOrderDetails?: CCDCourtOrders[];
  respondent1LoanCreditOption?: YesNoUpperCamelCase;
  respondent1LoanCreditDetails?: CCDLoanCredit[];
  responseToClaimAdmitPartWhyNotPayLRspec?: string;
  respondent1DQCarerAllowanceCredit?: YesNoUpperCamelCase;
  respondent1DQCarerAllowanceCreditFullAdmission?: YesNoUpperCamelCase;
  specDefendant1Debts?: CCDDebtDetails;
  respondent1DQRecurringIncome?: CCDRecurringIncome[];
  respondent1DQRecurringIncomeFA?: CCDRecurringIncome[];
  respondent1DQRecurringExpenses?: CCDRecurringExpenses[];
  respondent1DQRecurringExpensesFA?: CCDRecurringExpenses[];
  respondent1LiPResponse?: CCDRespondentLiPResponse;
}
