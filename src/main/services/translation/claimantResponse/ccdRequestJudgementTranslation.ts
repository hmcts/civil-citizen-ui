import { YesNo } from 'common/form/models/yesNo';
import { Claim } from 'common/models/claim';
import { toCCDYesNo } from '../response/convertToCCDYesNo';
import { calculateInterestToDate } from 'common/utils/interestUtils';
import { CCDClaim } from 'common/models/civilClaimResponse';
import {toCCDParty} from 'services/translation/response/convertToCCDParty';
import {CCDRepaymentPlanFrequency} from 'models/ccdResponse/ccdRepaymentPlan';
import {toCCDRepaymentPlanFrequency} from 'services/translation/response/convertToCCDRepaymentPlan';
import {CCDClaimantPaymentOption} from 'models/ccdResponse/ccdClaimantPaymentOption';
import {toCCDClaimantPaymentOption} from 'services/translation/claimantResponse/convertToCCDClaimantPaymentOption';
import {PaymentIntention} from 'form/models/admission/paymentIntention';
import {ClaimantResponse} from 'models/claimantResponse';
import {CCDClaimantPayBySetDate} from 'models/ccdResponse/ccdPayBySetDate';
import {convertDateToStringFormat} from 'common/utils/dateUtils';
import {convertToPence} from '../claim/moneyConversation';
import {PaymentOptionType} from 'common/form/models/admission/paymentOption/paymentOptionType';
import {toCCDDJPaymentFrequency} from '../response/convertToCCDDJPaymentFrequency';
import {toCCDDJPaymentOption} from './convertToCCDDJPaymentOption';

export interface ClaimantResponsePaymentPlanDetails {
  applicant1RepaymentOptionForDefendantSpec?: CCDClaimantPaymentOption;
  applicant1SuggestInstalmentsRepaymentFrequencyForDefendantSpec?: CCDRepaymentPlanFrequency;
  applicant1SuggestInstalmentsPaymentAmountForDefendantSpec?: number;
  applicant1SuggestInstalmentsFirstRepaymentDateForDefendantSpec?: string;
  applicant1RequestedPaymentDateForDefendantSpec?: CCDClaimantPayBySetDate;
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
  const claimantResponse = Object.assign(new ClaimantResponse(), claim.claimantResponse);
  if (claimantResponse.isCCJRequested) {
    let paymentIntention: PaymentIntention;
    if (claimantResponse.isClaimantAcceptedPaymentPlan) {
      paymentIntention = claim.getPaymentIntention();
    } else if (claimantResponse.isClaimantAcceptsCourtDecision) {
      if (claimantResponse.isCourtDecisionInFavourOfDefendant) {
        paymentIntention = claim.getPaymentIntention();
      } else if (claimantResponse.isCourtDecisionInFavourOfClaimant) {
        paymentIntention = claimantResponse.suggestedPaymentIntention;
      }
    }
    if (paymentIntention) {
      paymentPlanDetails = {
        applicant1RepaymentOptionForDefendantSpec: toCCDClaimantPaymentOption(paymentIntention.paymentOption),
        applicant1SuggestInstalmentsRepaymentFrequencyForDefendantSpec: toCCDRepaymentPlanFrequency(paymentIntention.repaymentPlan?.repaymentFrequency),
        applicant1SuggestInstalmentsPaymentAmountForDefendantSpec: paymentIntention.repaymentPlan?.paymentAmount,
        applicant1SuggestInstalmentsFirstRepaymentDateForDefendantSpec: convertDateToStringFormat(paymentIntention.repaymentPlan?.firstRepaymentDate),
        applicant1RequestedPaymentDateForDefendantSpec: {
          paymentSetDate: convertDateToStringFormat(paymentIntention.paymentDate),
        },
      };
    }
  }
  const claimantAcceptedPaidAmount = claimantResponse.ccjRequest?.paidAmount;
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

export const translateClaimantResponseRequestDefaultJudgementByAdmissionToCCD = (claim: Claim, claimFee: number): ClaimantResponseRequestJudgementByAdmissionOrDeterminationToCCD => {
  const claimantResponse = Object.assign(new ClaimantResponse(), claim.claimantResponse);
  const claimantAcceptedPaidAmount = claimantResponse.ccjRequest?.paidAmount;
  const ccjPaymentPaidSomeAmount = claimantAcceptedPaidAmount?.option === YesNo.YES ? (claimantAcceptedPaidAmount?.amount * 100).toString() : null;
  const ccjJudgmentLipInterest = calculateInterestToDate(claim) || 0;
  const paymentOption = claimantResponse.ccjRequest?.ccjPaymentOption?.type;
  return {
    ccjPaymentPaidSomeOption: toCCDYesNo(claimantAcceptedPaidAmount?.option),
    ccjPaymentPaidSomeAmount,
    ccjJudgmentAmountClaimFee: claimFee.toString(),
    ccjJudgmentLipInterest: ccjJudgmentLipInterest.toString(),
    applicant1: toCCDParty(claim.applicant1),
    respondent1: toCCDParty(claim.respondent1),
    totalClaimAmount: claim.totalClaimAmount,
    applicant1RepaymentOptionForDefendantSpec: toCCDClaimantPaymentOption(paymentOption),
    applicant1SuggestInstalmentsRepaymentFrequencyForDefendantSpec: toCCDRepaymentPlanFrequency(claimantResponse.ccjRequest?.repaymentPlanInstalments?.paymentFrequency),
    applicant1SuggestInstalmentsPaymentAmountForDefendantSpec: claimantResponse.ccjRequest?.repaymentPlanInstalments?.amount,
    applicant1SuggestInstalmentsFirstRepaymentDateForDefendantSpec: convertDateToStringFormat(claimantResponse.ccjRequest?.repaymentPlanInstalments?.firstPaymentDate?.date),
    applicant1RequestedPaymentDateForDefendantSpec: {
      paymentSetDate: convertDateToStringFormat(claimantResponse.ccjRequest?.defendantPaymentDate?.date),
    },
    partialPayment: toCCDYesNo(claimantResponse.ccjRequest?.paidAmount?.option),
    partialPaymentAmount: claimantResponse.ccjRequest?.paidAmount?.option === YesNo.YES ? convertToPence(claimantResponse.ccjRequest?.paidAmount?.amount).toString() : undefined,
    paymentTypeSelection: toCCDDJPaymentOption(claimantResponse.ccjRequest?.ccjPaymentOption?.type),
    paymentSetDate: claimantResponse.ccjRequest?.ccjPaymentOption?.type === PaymentOptionType.BY_SET_DATE ? claimantResponse.ccjRequest?.defendantPaymentDate?.date : undefined,
    repaymentFrequency: claimantResponse.ccjRequest?.ccjPaymentOption?.type === PaymentOptionType.INSTALMENTS ? toCCDDJPaymentFrequency(claimantResponse.ccjRequest?.repaymentPlanInstalments?.paymentFrequency) : undefined,
    repaymentDue:claimantResponse.ccjRequest?.paidAmount?.option === YesNo.YES ? (claimantResponse.ccjRequest?.paidAmount?.totalAmount - claimantResponse.ccjRequest?.paidAmount?.amount).toString() : undefined,
    repaymentSuggestion: claimantResponse.ccjRequest?.ccjPaymentOption?.type === PaymentOptionType.INSTALMENTS ? claimantResponse.ccjRequest?.repaymentPlanInstalments?.amount.toString() : undefined,
  };
};
