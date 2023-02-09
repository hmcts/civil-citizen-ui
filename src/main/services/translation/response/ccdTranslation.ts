import {Claim} from '../../../common/models/claim';
import {CCDResponse} from '../../../common/models/ccdResponse/ccdResponse';
import {YesNoUpperCamelCase} from '../../../common/form/models/yesNo';
import {toAgreedMediation} from './convertToCCDAgreedMediation';
import {toCCDParty} from './convertToCCDParty';
import {toCCDRepaymentPlan} from './convertToCCDRepaymentPlan';
import {toCCDPaymentOption} from './convertToCCDPaymentOption';
import {toCCDPayBySetDate} from './convertToCCDPayBySetDate';
import {PaymentIntention} from 'form/models/admission/paymentIntention';

export const translateDraftResponseToCCD = (claim: Claim, addressHasChange: boolean): CCDResponse => {
  const paymentIntention = getPaymentIntetntion(claim);
  return {
    respondent1ClaimResponseTypeForSpec: claim.respondent1?.responseType,
    defenceAdmitPartPaymentTimeRouteRequired: toCCDPaymentOption(paymentIntention?.paymentOption),
    respondent1RepaymentPlan: toCCDRepaymentPlan(paymentIntention?.repaymentPlan),
    respondToClaimAdmitPartLRspec: toCCDPayBySetDate(paymentIntention?.paymentDate),
    responseClaimMediationSpecRequired: toAgreedMediation(claim.mediation),
    specAoSApplicantCorrespondenceAddressRequired: addressHasChange ? YesNoUpperCamelCase.NO : YesNoUpperCamelCase.YES,
    totalClaimAmount: claim.totalClaimAmount,
    respondent1: toCCDParty(claim.respondent1, undefined),
  };
};

const getPaymentIntetntion = (claim: Claim): PaymentIntention => {
  let paymentIntention;
  if(claim.isPartialAdmission()) {
    paymentIntention = claim.partialAdmission?.paymentIntention;
  }else {
    paymentIntention = claim.fullAdmission?.paymentIntention;
  }
  return paymentIntention;
};
