import {Claim} from '../../../common/models/claim';
import {CCDResponse} from '../../../common/models/ccdResponse/ccdResponse';
import {toCCDPaymentOption} from '../../../common/models/ccdResponse/ccdPaymentOption';
import {toCCDRepaymentPlan} from '../../../common/models/ccdResponse/ccdRepaymentPlan';

export const translateDraftResponseToCCD = (claim: Claim): CCDResponse => {
  return {
    respondent1: claim.respondent1,
    paymentTypeSelection : toCCDPaymentOption(claim.paymentOption),
    respondent1RepaymentPlan: toCCDRepaymentPlan(claim.repaymentPlan),
  };
};
