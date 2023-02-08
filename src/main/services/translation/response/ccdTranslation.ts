import {Claim} from '../../../common/models/claim';
import {CCDResponse} from '../../../common/models/ccdResponse/ccdResponse';
import {YesNoUpperCamelCase} from '../../../common/form/models/yesNo';
import {toAgreedMediation} from './convertToCCDAgreedMediation';
import {toCCDParty} from './convertToCCDParty';
import {toCCDRepaymentPlan} from './convertToCCDRepaymentPlan';
import {toCCDPaymentOption} from './convertToCCDPaymentOption';
import {toCCDPayBySetDate} from './convertToCCDPayBySetDate';
import {toCCDBankAccountList} from "services/translation/response/convertToCCDBankAccount";
import {toCCDHomeDetails} from "services/translation/response/convertToCCDHomeDetails";
import {toCCDPartnerAndDependents} from "services/translation/response/convertToCCDPartnerAndDependent";
import {toCCDUnemploymentDetails} from "services/translation/response/convertToCCDUnemploymentDetails";

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
    respondent1DQHomeDetails: toCCDHomeDetails(claim.statementOfMeans?.residence),
    respondent1PartnerAndDependent: toCCDPartnerAndDependents(claim.statementOfMeans),
    defenceAdmitPartEmploymentTypeRequired: claim.statementOfMeans?.employment?.declared ? YesNoUpperCamelCase.YES : YesNoUpperCamelCase.NO,
    respondToClaimAdmitPartUnemployedLRspec: toCCDUnemploymentDetails(claim.statementOfMeans?.unemployment),
  };
};
