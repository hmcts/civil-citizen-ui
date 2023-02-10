import {Claim} from 'models/claim';
import {CCDResponse} from 'models/ccdResponse/ccdResponse';
import {YesNoUpperCamelCase} from 'form/models/yesNo';
import {toAgreedMediation} from './convertToCCDAgreedMediation';
import {toCCDParty} from './convertToCCDParty';
import {toCCDRepaymentPlan} from './convertToCCDRepaymentPlan';
import {toCCDPaymentOption} from './convertToCCDPaymentOption';
import {toCCDPayBySetDate} from './convertToCCDPayBySetDate';

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
  };
};
