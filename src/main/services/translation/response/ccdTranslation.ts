import {Claim} from '../../../common/models/claim';
import {CCDResponse} from '../../../common/models/ccdResponse/ccdResponse';
import {toAgreedMediation} from './convertToCCDAgreedMediation';
import {YesNoUpperCamelCase} from '../../../common/form/models/yesNo';
import {toCCDParty} from './convertToCCDParty';
import {toCCDRepaymentPlan} from './convertToCCDRepaymentPlan';
import {toCCDPaymentOption} from './convertToCCDPaymentOption';
import {toCCDPayBySetDate} from './convertToCCDPayBySetDate';

export const translateDraftResponseToCCD = (claim: Claim, addressHasChange: boolean): CCDResponse => {
  // TODO: should we include everything inside caseData
  return {
    respondent1ClaimResponseTypeForSpec: claim.respondent1?.responseType,
    defenceAdmitPartPaymentTimeRouteRequired: toCCDPaymentOption(claim.partialAdmission.paymentIntention.paymentOption), // defenceAdmitPartPaymentTimeRouteRequired: toCCDPaymentOption(claim.paymentOption),
    respondent1RepaymentPlan: toCCDRepaymentPlan(claim.repaymentPlan),
    respondToClaimAdmitPartLRspec: toCCDPayBySetDate(claim.partialAdmission.paymentIntention.paymentDate), // respondToClaimAdmitPartLRspec: toCCDPayBySetDate(claim.paymentDate),
    responseClaimMediationSpecRequired: toAgreedMediation(claim.mediation),
    specAoSApplicantCorrespondenceAddressRequired: addressHasChange ? YesNoUpperCamelCase.NO : YesNoUpperCamelCase.YES,
    totalClaimAmount: claim.totalClaimAmount,
    // ------------- START TASK A ------------- 
    // YOUR DETAILS
    respondent1: toCCDParty(claim.respondent1),
    // respondent1Represented: claim.respondent1.contactPerson, // TODO: where is contactPerson in CCD?
    // RESPONSE DEADLINE
    // x: claim.responseDeadline.option, //  enum [ALREADY_AGREED, NO, REQUEST_REFUSED, YES]
    // x: claim.responseDeadline.additionalTime, // enum [MORE_THAN_28_DAYS, UP_TO_28_DAYS]
    // x: claim.responseDeadline.calculatedResponseDeadline, // date
    respondentSolicitor1AgreedDeadlineExtension: claim.responseDeadline.calculatedResponseDeadline, // date, TODO: sure is calculated and no agreed?
    respondent1ResponseDeadline: claim.respondent1ResponseDeadline.toDateString(), // date
    // ------------- END TASK A ------------- 
  };
};
