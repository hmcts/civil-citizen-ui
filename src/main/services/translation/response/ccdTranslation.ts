import {Claim} from '../../../common/models/claim';
import {CCDResponse} from '../../../common/models/ccdResponse/ccdResponse';
import {toCCDRepaymentPlan} from '../../../common/models/ccdResponse/ccdRepaymentPlan';
import {toCCDPaymentOption} from '../../../common/models/ccdResponse/ccdPaymentOption';
import {toCCDPayBySetDate} from '../../../common/models/ccdResponse/ccdPayBySetDate';
import {toAgreedMediation} from '../../../common/models/ccdResponse/ccdAgreedMediation';

export const translateDraftResponseToCCD = (claim: Claim): CCDResponse => {
  return {
    respondent1ClaimResponseTypeForSpec: claim.respondent1?.responseType,
    defenceAdmitPartPaymentTimeRouteRequired: toCCDPaymentOption(claim.paymentOption),
    respondent1RepaymentPlan: toCCDRepaymentPlan(claim.repaymentPlan),
    respondToClaimAdmitPartLRspec: toCCDPayBySetDate(claim.paymentDate),
    specAoSApplicantCorrespondenceAddressRequired: 'No', // TODO This part needs to be change in separate story CIV-4571
    responseClaimMediationSpecRequired: toAgreedMediation(claim.mediation?.canWeUse?.option),
  };
};
