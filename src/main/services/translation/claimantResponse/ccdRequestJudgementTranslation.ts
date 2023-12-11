import { YesNo } from 'common/form/models/yesNo';
import { Claim } from 'common/models/claim';
import { toCCDYesNo } from '../response/convertToCCDYesNo';
import { calculateInterestToDate } from 'common/utils/interestUtils';
import { CCDClaim } from 'common/models/civilClaimResponse';
import { toCCDParty } from 'services/translation/response/convertToCCDParty';
import { CCDRepaymentPlanFrequency } from 'models/ccdResponse/ccdRepaymentPlan';
import { toCCDRepaymentPlanFrequency } from 'services/translation/response/convertToCCDRepaymentPlan';
import { CCDClaimantPaymentOption } from 'models/ccdResponse/ccdClaimantPaymentOption';
import { toCCDClaimantPaymentOption } from 'services/translation/claimantResponse/convertToCCDClaimantPaymentOption';
import { CourtProposedPlanOptions } from 'form/models/claimantResponse/courtProposedPlan';
import { RepaymentDecisionType } from 'models/claimantResponse/RepaymentDecisionType';
import { ChooseHowProceed } from 'models/chooseHowProceed';
import {PaymentIntention} from 'form/models/admission/paymentIntention';

export interface PaymentDate {
  paymentSetDate: Date,
}

export interface ClaimantResponsePaymentPlanDetails {
  applicant1RepaymentOptionForDefendantSpec?: CCDClaimantPaymentOption;
  applicant1SuggestInstalmentsRepaymentFrequencyForDefendantSpec?: CCDRepaymentPlanFrequency;
  applicant1SuggestInstalmentsPaymentAmountForDefendantSpec?: number;
  applicant1SuggestInstalmentsFirstRepaymentDateForDefendantSpec?: Date;
  applicant1RequestedPaymentDateForDefendantSpec?: PaymentDate;
}

export interface ClaimantResponseRequestJudgementByAdmissionOrDeterminationToCCD
  extends ClaimantResponsePaymentPlanDetails, CCDClaim {
  ccjPaymentPaidSomeOption?: string;
  ccjPaymentPaidSomeAmount?: string;
  ccjJudgmentAmountClaimFee?: string;
  ccjJudgmentLipInterest?: string;
}

export const translateClaimantResponseRequestJudgementByAdmissionOrDeterminationToCCD = (claim: Claim, claimFee: number): ClaimantResponseRequestJudgementByAdmissionOrDeterminationToCCD => {
  let paymentPlanDetails: ClaimantResponsePaymentPlanDetails;
  if (claim.claimantResponse?.chooseHowToProceed?.option === ChooseHowProceed.REQUEST_A_CCJ) {
    let paymentIntention: PaymentIntention;
    if (claim.claimantResponse.fullAdmitSetDateAcceptPayment?.option === YesNo.YES) {
      paymentIntention = claim.getPaymentIntention();
    } else if (claim.claimantResponse.courtProposedPlan?.decision === CourtProposedPlanOptions.ACCEPT_REPAYMENT_PLAN) {
      if (claim.claimantResponse.courtDecision == RepaymentDecisionType.IN_FAVOUR_OF_DEFENDANT) {
        paymentIntention = claim.getPaymentIntention();
      } else if (claim.claimantResponse.courtDecision == RepaymentDecisionType.IN_FAVOUR_OF_CLAIMANT) {
        paymentIntention = claim.claimantResponse.suggestedPaymentIntention;
      }
    }
    if (paymentIntention) {
      paymentPlanDetails = {
        applicant1RepaymentOptionForDefendantSpec: toCCDClaimantPaymentOption(paymentIntention.paymentOption),
        applicant1SuggestInstalmentsRepaymentFrequencyForDefendantSpec: toCCDRepaymentPlanFrequency(paymentIntention.repaymentPlan?.repaymentFrequency),
        applicant1SuggestInstalmentsPaymentAmountForDefendantSpec: paymentIntention.repaymentPlan?.paymentAmount,
        applicant1SuggestInstalmentsFirstRepaymentDateForDefendantSpec: paymentIntention.repaymentPlan?.firstRepaymentDate,
        applicant1RequestedPaymentDateForDefendantSpec: {
          paymentSetDate: paymentIntention.paymentDate,
        },
      };
    }
  }
  const claimantAcceptedPaidAmount = claim.claimantResponse?.ccjRequest?.paidAmount;
  const ccjPaymentPaidSomeAmount = claimantAcceptedPaidAmount?.option === YesNo.YES ? (claimantAcceptedPaidAmount?.amount * 100).toString() : null;
  const ccjJudgmentLipInterest = calculateInterestToDate(claim) || 0;
  return {
    ccjPaymentPaidSomeOption: toCCDYesNo(claimantAcceptedPaidAmount?.option),
    ccjPaymentPaidSomeAmount,
    ccjJudgmentAmountClaimFee: claimFee.toString(),
    ccjJudgmentLipInterest: ccjJudgmentLipInterest.toString(),
    applicant1: toCCDParty(claim.applicant1),
    respondent1: toCCDParty(claim.respondent1),
    totalClaimAmount: claim.totalClaimAmount,
    ...paymentPlanDetails,
  };
};
