import {Claim} from '../../../common/models/claim';
import {CCDResponse} from '../../../common/models/ccdResponse/ccdResponse';
import {YesNoUpperCamelCase} from '../../../common/form/models/yesNo';
import {toAgreedMediation} from './convertToCCDAgreedMediation';
import {toCCDParty} from './convertToCCDParty';
import {toCCDRepaymentPlan} from './convertToCCDRepaymentPlan';
import {toCCDPaymentOption} from './convertToCCDPaymentOption';
import {toCCDPayBySetDate} from './convertToCCDPayBySetDate';
import {toCCDBankAccountList} from "./convertToCCDBankAccount";
import {toCCDHomeDetails} from "./convertToCCDHomeDetails";
import {toCCDPartnerAndDependents} from "./convertToCCDPartnerAndDependent";
import {toCCDUnemploymentDetails} from "./convertToCCDUnemploymentDetails";
import {toCCDEmploymentSelection} from "./convertToCCDEmploymentSelection";
import {toCCDEmploymentDetails} from "services/translation/response/convertToCCDEmployerDetails";
import {toCCDSelfEmploymentDetails} from "services/translation/response/convertToCCDSelfEmploymentDetails";
import {toCCDCourtOrders} from "services/translation/response/convertToCCDCourtOrders";
import {toCCDLoanCredit} from "services/translation/response/convertToCCDLoanCredit";
import {toCCDCarerAllowanceCredit} from "services/translation/response/convertToCCDCarerAllowanceCredit";
import {ResponseType} from "form/models/responseType";
import {toCCDDebtDetails} from "services/translation/response/convertToCCDDebtDetails";
import {toCCDRecurringIncomeField} from "services/translation/response/convertToCCDRecurringIncome";
import {toCCDRecurringExpensesField} from "services/translation/response/convertToCCDRecurringExpense";
import {toCCDFieldsOnlyInCui} from "services/translation/response/convertToCCDFromCuiOnlyFields";

export const translateDraftResponseToCCD = (claim: Claim, addressHasChange: boolean): CCDResponse => {
  return {
    respondent1ClaimResponseTypeForSpec: claim.respondent1?.responseType,
    defenceAdmitPartPaymentTimeRouteRequired: toCCDPaymentOption(claim.partialAdmission.paymentIntention.paymentOption),
    respondent1RepaymentPlan: toCCDRepaymentPlan(claim.partialAdmission?.paymentIntention?.repaymentPlan),
    respondToClaimAdmitPartLRspec: toCCDPayBySetDate(claim.partialAdmission.paymentIntention.paymentDate),
    responseClaimMediationSpecRequired: toAgreedMediation(claim.mediation),
    specAoSApplicantCorrespondenceAddressRequired: addressHasChange ? YesNoUpperCamelCase.NO : YesNoUpperCamelCase.YES,
    totalClaimAmount: claim.totalClaimAmount,
    respondent1: toCCDParty(claim.respondent1, undefined),
    respondent1BankAccountList: toCCDBankAccountList(claim.statementOfMeans?.bankAccounts),
    disabilityPremiumPayments: claim.statementOfMeans?.disability.option === 'true' ? YesNoUpperCamelCase.YES : YesNoUpperCamelCase.NO,
    severeDisabilityPremiumPayments: claim.statementOfMeans?.severeDisability.option === 'true' ? YesNoUpperCamelCase.YES : YesNoUpperCamelCase.NO,
    respondent1DQHomeDetails: toCCDHomeDetails(claim.statementOfMeans?.residence),
    respondent1PartnerAndDependent: toCCDPartnerAndDependents(claim.statementOfMeans),
    defenceAdmitPartEmploymentTypeRequired: claim.statementOfMeans?.employment?.declared ? YesNoUpperCamelCase.YES : YesNoUpperCamelCase.NO,
    respondToClaimAdmitPartEmploymentTypeLRspec: toCCDEmploymentSelection(claim.statementOfMeans?.employment?.employmentType),
    responseClaimAdmitPartEmployer: toCCDEmploymentDetails(claim.statementOfMeans?.employers),
    specDefendant1SelfEmploymentDetails: toCCDSelfEmploymentDetails(claim.statementOfMeans),
    respondToClaimAdmitPartUnemployedLRspec: toCCDUnemploymentDetails(claim.statementOfMeans?.unemployment),
    respondent1CourtOrderPaymentOption: claim.statementOfMeans?.courtOrders?.declared ? YesNoUpperCamelCase.YES : YesNoUpperCamelCase.NO,
    respondent1CourtOrderDetails: toCCDCourtOrders(claim.statementOfMeans?.courtOrders),
    respondent1LoanCreditOption: claim.statementOfMeans?.debts?.option === 'true' ? YesNoUpperCamelCase.YES : YesNoUpperCamelCase.NO,
    respondent1LoanCreditDetails: toCCDLoanCredit(claim.statementOfMeans?.debts?.debtsItems),
    responseToClaimAdmitPartWhyNotPayLRspec: claim.statementOfMeans?.explanation?.text,
    respondent1DQCarerAllowanceCredit: toCCDCarerAllowanceCredit(claim, ResponseType.PART_ADMISSION),
    respondent1DQCarerAllowanceCreditFullAdmission: toCCDCarerAllowanceCredit(claim, ResponseType.FULL_ADMISSION),
    specDefendant1Debts: toCCDDebtDetails(claim.statementOfMeans?.priorityDebts),
    respondent1DQRecurringIncome: toCCDRecurringIncomeField(claim, ResponseType.PART_ADMISSION),
    respondent1DQRecurringIncomeFA: toCCDRecurringIncomeField(claim, ResponseType.FULL_ADMISSION),
    respondent1DQRecurringExpenses: toCCDRecurringExpensesField(claim, ResponseType.PART_ADMISSION),
    respondent1DQRecurringExpensesFA: toCCDRecurringExpensesField(claim, ResponseType.PART_ADMISSION),
    respondent1ResponseFromCui: toCCDFieldsOnlyInCui(claim),
  };
};
