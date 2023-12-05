import { YesNo } from 'common/form/models/yesNo';
import { Claim } from 'common/models/claim';
import { toCCDYesNo } from '../response/convertToCCDYesNo';
import { calculateInterestToDate } from 'common/utils/interestUtils';
import { CCDClaim } from 'common/models/civilClaimResponse';
import {toCCDParty} from 'services/translation/response/convertToCCDParty';
import {CCDRepaymentPlanFrequency} from 'models/ccdResponse/ccdRepaymentPlan';
import {toCCDRepaymentPlanFrequency} from 'services/translation/response/convertToCCDRepaymentPlan';
import {PaymentOptionType} from 'form/models/admission/paymentOption/paymentOptionType';
import {CCDClaimantPaymentOption} from 'models/ccdResponse/ccdClaimantPaymentOption';
import {toCCDClaimantPaymentOption} from 'services/translation/claimantResponse/convertToCCDClaimantPaymentOption';

export interface ClaimantResponseRequestJudgementByAdmissionToCCD extends CCDClaim {
  ccjPaymentPaidSomeOption: string,
  ccjPaymentPaidSomeAmount: string,
  ccjJudgmentAmountClaimFee: string,
  ccjJudgmentLipInterest: string,
  applicant1RepaymentOptionForDefendantSpec: CCDClaimantPaymentOption,
  applicant1SuggestInstalmentsRepaymentFrequencyForDefendantSpec:CCDRepaymentPlanFrequency,
  applicant1SuggestInstalmentsPaymentAmountForDefendantSpec: number,
  applicant1SuggestInstalmentsFirstRepaymentDateForDefendantSpec: Date,
  applicant1RequestedPaymentDateForDefendantSpec: Date,
}

export const translateClaimantResponseRequestJudgementByAdmissionToCCD = (claim: Claim, claimFee: number): ClaimantResponseRequestJudgementByAdmissionToCCD => {
  const claimantAcceptedPaidAmount = claim.claimantResponse?.ccjRequest?.paidAmount;
  const ccjPaymentPaidSomeAmount = claimantAcceptedPaidAmount?.option === YesNo.YES ? (claimantAcceptedPaidAmount?.amount * 100).toString() : null;
  const ccjJudgmentLipInterest = calculateInterestToDate(claim) || 0;
  const paymentOption = claim.claimantResponse.ccjRequest.ccjPaymentOption.type;
  return {
    ccjPaymentPaidSomeOption: toCCDYesNo(claimantAcceptedPaidAmount?.option),
    ccjPaymentPaidSomeAmount,
    ccjJudgmentAmountClaimFee: claimFee.toString(),
    ccjJudgmentLipInterest: ccjJudgmentLipInterest.toString(),
    applicant1: toCCDParty(claim.applicant1),
    respondent1: toCCDParty(claim.respondent1),
    totalClaimAmount: claim.totalClaimAmount,
    applicant1RepaymentOptionForDefendantSpec: toCCDClaimantPaymentOption(claim.claimantResponse.ccjRequest.ccjPaymentOption.type),
    applicant1SuggestInstalmentsRepaymentFrequencyForDefendantSpec: (paymentOption == PaymentOptionType.INSTALMENTS) ? toCCDRepaymentPlanFrequency(claim.claimantResponse.ccjRequest.repaymentPlanInstalments.paymentFrequency) : undefined,
    applicant1SuggestInstalmentsPaymentAmountForDefendantSpec: (paymentOption == PaymentOptionType.INSTALMENTS) ? claim.claimantResponse?.ccjRequest?.repaymentPlanInstalments.amount : undefined,
    applicant1SuggestInstalmentsFirstRepaymentDateForDefendantSpec: (paymentOption == PaymentOptionType.INSTALMENTS) ? claim.claimantResponse.ccjRequest.repaymentPlanInstalments.firstPaymentDate.date : undefined,
    applicant1RequestedPaymentDateForDefendantSpec: (paymentOption == PaymentOptionType.BY_SET_DATE) ? claim.claimantResponse.ccjRequest.defendantPaymentDate.date : undefined,
  };
};
