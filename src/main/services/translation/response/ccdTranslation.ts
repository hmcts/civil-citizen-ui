import {Claim} from '../../../common/models/claim';
import {CCDResponse} from '../../../common/models/ccdResponse/ccdResponse';
import {toCCDRepaymentPlan} from '../../../common/models/ccdResponse/ccdRepaymentPlan';
import {toCCDPaymentOption} from '../../../common/models/ccdResponse/ccdPaymentOption';
import {toCCDPayBySetDate} from '../../../common/models/ccdResponse/ccdPayBySetDate';

export const translateDraftResponseToCCD = (claim: Claim): CCDResponse => {
  return {
    respondent1ClaimResponseTypeForSpec: claim.respondent1?.responseType,
    defenceAdmitPartPaymentTimeRouteRequired: toCCDPaymentOption(claim.paymentOption),
    respondent1RepaymentPlan: toCCDRepaymentPlan(claim.repaymentPlan),
    respondToClaimAdmitPartLRspec: toCCDPayBySetDate(claim.paymentDate),
  };
};
