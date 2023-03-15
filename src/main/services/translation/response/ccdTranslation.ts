import {Claim} from 'models/claim';
import {CCDResponse} from 'models/ccdResponse/ccdResponse';
import {YesNoUpperCamelCase} from 'form/models/yesNo';
import {toAgreedMediation} from './convertToCCDAgreedMediation';
import {toCCDParty} from './convertToCCDParty';
import {toCCDRepaymentPlan} from './convertToCCDRepaymentPlan';
import {toCCDPaymentOption} from './convertToCCDPaymentOption';
import {toCCDPayBySetDate} from './convertToCCDPayBySetDate';
import {toCCDBankAccountList} from './convertToCCDBankAccount';
import {toCCDHomeDetails} from './convertToCCDHomeDetails';
import {toCCDPartnerAndDependents} from './convertToCCDPartnerAndDependent';
import {toCCDUnemploymentDetails} from './convertToCCDUnemploymentDetails';
import {toCCDEmploymentSelection} from './convertToCCDEmploymentSelection';
import {toCCDEmploymentDetails} from 'services/translation/response/convertToCCDEmployerDetails';
import {toCCDSelfEmploymentDetails} from 'services/translation/response/convertToCCDSelfEmploymentDetails';
import {toCCDCourtOrders} from 'services/translation/response/convertToCCDCourtOrders';
import {toCCDLoanCredit} from 'services/translation/response/convertToCCDLoanCredit';
import {toCCDCarerAllowanceCredit} from 'services/translation/response/convertToCCDCarerAllowanceCredit';
import {ResponseType} from 'form/models/responseType';
import {toCCDDebtDetails} from 'services/translation/response/convertToCCDDebtDetails';
import {toCCDRecurringIncomeField} from 'services/translation/response/convertToCCDRecurringIncome';
import {toCCDRecurringExpensesField} from 'services/translation/response/convertToCCDRecurringExpense';
import {
  toCCDRespondentLiPResponse,
} from 'services/translation/response/convertToCCDRespondentLiPResponse';
import {
  toCCDYesNoFromBoolean,
  toCCDYesNoFromGenericYesNo,
} from 'services/translation/response/convertToCCDYesNo';

export const translateDraftResponseToCCD = (claim: Claim, addressHasChange: boolean): CCDResponse => {
  const paymentIntention = claim.getPaymentIntention();
  return {
    respondent1ClaimResponseTypeForSpec: claim.respondent1?.responseType,
    defenceAdmitPartPaymentTimeRouteRequired: toCCDPaymentOption(paymentIntention?.paymentOption),
    respondent1RepaymentPlan: toCCDRepaymentPlan(paymentIntention?.repaymentPlan),
    respondToClaimAdmitPartLRspec: toCCDPayBySetDate(paymentIntention?.paymentDate),
    responseClaimMediationSpecRequired: toAgreedMediation(claim.mediation),
    specAoSApplicantCorrespondenceAddressRequired: addressHasChange ? YesNoUpperCamelCase.NO : YesNoUpperCamelCase.YES,
    totalClaimAmount: claim.totalClaimAmount,
    respondent1: toCCDParty(claim.respondent1),
    respondent1BankAccountList: toCCDBankAccountList(claim.statementOfMeans?.bankAccounts),
    disabilityPremiumPayments: toCCDYesNoFromGenericYesNo(claim.statementOfMeans?.disability),
    severeDisabilityPremiumPayments: toCCDYesNoFromGenericYesNo(claim.statementOfMeans?.severeDisability),
    respondent1DQHomeDetails: toCCDHomeDetails(claim.statementOfMeans?.residence),
    respondent1PartnerAndDependent: toCCDPartnerAndDependents(claim.statementOfMeans),
    defenceAdmitPartEmploymentTypeRequired: toCCDYesNoFromBoolean(claim.statementOfMeans?.employment?.declared),
    respondToClaimAdmitPartEmploymentTypeLRspec: toCCDEmploymentSelection(claim.statementOfMeans?.employment?.employmentType),
    responseClaimAdmitPartEmployer: toCCDEmploymentDetails(claim.statementOfMeans?.employers),
    specDefendant1SelfEmploymentDetails: toCCDSelfEmploymentDetails(claim.statementOfMeans),
    respondToClaimAdmitPartUnemployedLRspec: toCCDUnemploymentDetails(claim.statementOfMeans?.unemployment),
    respondent1CourtOrderPaymentOption: toCCDYesNoFromBoolean(claim.statementOfMeans?.courtOrders?.declared),
    respondent1CourtOrderDetails: toCCDCourtOrders(claim.statementOfMeans?.courtOrders),
    respondent1LoanCreditOption: toCCDYesNoFromGenericYesNo(claim.statementOfMeans?.debts),
    respondent1LoanCreditDetails: toCCDLoanCredit(claim.statementOfMeans?.debts?.debtsItems),
    responseToClaimAdmitPartWhyNotPayLRspec: claim.statementOfMeans?.explanation?.text,
    respondent1DQCarerAllowanceCredit: toCCDCarerAllowanceCredit(claim, ResponseType.PART_ADMISSION),
    respondent1DQCarerAllowanceCreditFullAdmission: toCCDCarerAllowanceCredit(claim, ResponseType.FULL_ADMISSION),
    specDefendant1Debts: toCCDDebtDetails(claim.statementOfMeans?.priorityDebts),
    respondent1DQRecurringIncome: toCCDRecurringIncomeField(claim, ResponseType.PART_ADMISSION),
    respondent1DQRecurringIncomeFA: toCCDRecurringIncomeField(claim, ResponseType.FULL_ADMISSION),
    respondent1DQRecurringExpenses: toCCDRecurringExpensesField(claim, ResponseType.PART_ADMISSION),
    respondent1DQRecurringExpensesFA: toCCDRecurringExpensesField(claim, ResponseType.FULL_ADMISSION),
    respondent1LiPResponse: toCCDRespondentLiPResponse(claim),

  };
};
