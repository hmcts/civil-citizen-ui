import {CCDPaymentOption} from './ccdPaymentOption';
import {ClaimUpdate} from 'models/events/eventDto';
import {CCDRepaymentPlan} from './ccdRepaymentPlan';
import {CCDPayBySetDate} from './ccdPayBySetDate';
import {YesNoUpperCamelCase} from 'common/form/models/yesNo';
import {CCDParty} from './ccdParty';
import {CCDRespondToClaim} from 'models/ccdResponse/ccdRespondToClaim';
import {TimelineUploadTypeSpec} from 'models/ccdResponse/ccdHowToAddTimeline';
import {CCDTimeLineOfEvents} from 'models/ccdResponse/ccdTimeLineOfEvents';
import {CCDEvidence} from 'models/ccdResponse/ccdEvidence';
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
import {CCDWelshLanguageRequirements} from 'models/ccdResponse/ccdWelshLanguageRequirements';
import {CCDVulnerability} from 'models/ccdResponse/ccdVulnerability';
import {CCDSpecificCourtLocations} from 'models/ccdResponse/ccdSpecificCourtLocations';
import {CCDWitnesses} from 'models/ccdResponse/ccdWitnesses';
import {CCDSmallClaimHearing} from 'models/ccdResponse/ccdSmallClaimHearing';
import {CCDFastClaimHearing} from 'models/ccdResponse/ccdFastClaimHearing';
import {CCDDQSupportRequirements,CCDExpert} from 'models/ccdResponse/ccdExpert';
import {CCDFinancialDetailsLiP} from 'models/ccdResponse/ccdFinancialDetailsLiP';
import {CcdMediationCarm} from 'models/ccdResponse/ccdMediationCarm';

export interface CCDResponse extends ClaimUpdate {
  respondent1ClaimResponseTypeForSpec?: string;
  defenceAdmitPartPaymentTimeRouteRequired?: CCDPaymentOption;
  respondent1RepaymentPlan?: CCDRepaymentPlan;
  respondToClaimAdmitPartLRspec?: CCDPayBySetDate;
  responseClaimMediationSpecRequired?: string;
  specAoSApplicantCorrespondenceAddressRequired?: YesNoUpperCamelCase;
  respondToAdmittedClaim?: CCDRespondToClaim;
  specDefenceAdmittedRequired?: YesNoUpperCamelCase;
  respondToAdmittedClaimOwingAmountPounds?: string;
  respondToAdmittedClaimOwingAmount?: string;
  specClaimResponseTimelineList?: TimelineUploadTypeSpec;
  specResponseTimelineOfEvents?: CCDTimeLineOfEvents[];
  specResponselistYourEvidenceList?: CCDEvidence[];
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
  respondent1LiPResponseCarm?: CcdMediationCarm;
  respondent1LiPFinancialDetails?: CCDFinancialDetailsLiP,
  respondent1DQLanguage?: CCDWelshLanguageRequirements;
  respondent1DQVulnerabilityQuestions?: CCDVulnerability;
  respondent1DQRequestedCourt?: CCDSpecificCourtLocations;
  respondent1DQWitnesses?: CCDWitnesses;
  respondent1DQHearingSmallClaim?: CCDSmallClaimHearing;
  respondent1DQHearingFastClaim?: CCDFastClaimHearing;
  respondent1DQExperts?: CCDExpert;
  respondent1DQHearingSupport?: CCDDQSupportRequirements;
  responseClaimExpertSpecRequired?: YesNoUpperCamelCase;
}
