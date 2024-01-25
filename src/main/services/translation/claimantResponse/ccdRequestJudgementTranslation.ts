import {YesNo, YesNoUpperCamelCase} from 'common/form/models/yesNo';
import {Claim} from 'common/models/claim';
import {toCCDYesNo} from '../response/convertToCCDYesNo';
import {calculateInterestToDate} from 'common/utils/interestUtils';
import {CCDClaim} from 'common/models/civilClaimResponse';
import {toCCDDJPaymentOption} from './convertToCCDDJPaymentOption';
import {convertToPence} from '../claim/moneyConversation';
import {PaymentOptionType} from 'common/form/models/admission/paymentOption/paymentOptionType';
import {toCCDDJPaymentFrequency} from '../response/convertToCCDDJPaymentFrequency';
import {CCDDJPaymentOption} from 'common/models/ccdResponse/ccdDJPaymentOption';
import {CCDPaymentFrequency} from 'common/models/ccdResponse/ccdPaymentFrequency';

export interface ClaimantResponseRequestDefaultJudgementToCCD extends CCDClaim {
  ccjPaymentPaidSomeOption?: string,
  ccjPaymentPaidSomeAmount?: string,
  ccjJudgmentAmountClaimFee?: string,
  ccjJudgmentLipInterest?: string,
  partialPayment?: YesNoUpperCamelCase;
  partialPaymentAmount?: string;
  paymentTypeSelection?: CCDDJPaymentOption;
  paymentSetDate?: Date;
  repaymentDue?: string;
  repaymentFrequency?: CCDPaymentFrequency;
  repaymentSuggestion?: string;
}

export const translateClaimantResponseRequestDefaultJudgementToCCD = (claim: Claim, claimFee: number): ClaimantResponseRequestDefaultJudgementToCCD => {
  const claimantAcceptedpaidAmount = claim.claimantResponse?.ccjRequest?.paidAmount;
  const ccjPaymentPaidSomeAmount = claimantAcceptedpaidAmount?.option === YesNo.YES ? (claimantAcceptedpaidAmount?.amount * 100).toString() : null;
  const ccjJudgmentLipInterest = calculateInterestToDate(claim) || 0;
  return {
    ccjPaymentPaidSomeOption: toCCDYesNo(claimantAcceptedpaidAmount?.option),
    ccjPaymentPaidSomeAmount,
    ccjJudgmentAmountClaimFee: claimFee.toString(),
    ccjJudgmentLipInterest: ccjJudgmentLipInterest.toString(),
    partialPayment: toCCDYesNo(claim.claimantResponse?.ccjRequest?.paidAmount?.option),
    partialPaymentAmount: claim.claimantResponse?.ccjRequest?.paidAmount?.option === YesNo.YES ? convertToPence(claim.claimantResponse?.ccjRequest?.paidAmount?.amount).toString() : undefined,
    paymentTypeSelection: toCCDDJPaymentOption( claim.claimantResponse?.ccjRequest?.ccjPaymentOption?.type),
    paymentSetDate: claim.claimantResponse?.ccjRequest?.ccjPaymentOption?.type === PaymentOptionType.BY_SET_DATE ? claim.claimantResponse?.ccjRequest?.defendantPaymentDate?.date : undefined,
    repaymentFrequency: claim.claimantResponse?.ccjRequest?.ccjPaymentOption?.type === PaymentOptionType.INSTALMENTS ? toCCDDJPaymentFrequency(claim.claimantResponse?.ccjRequest?.repaymentPlanInstalments?.paymentFrequency) : undefined,
    repaymentDue:claim.claimantResponse?.ccjRequest?.paidAmount?.option === YesNo.YES ? (claim.claimantResponse?.ccjRequest?.paidAmount?.totalAmount - claim.claimantResponse?.ccjRequest?.paidAmount?.amount).toString() : undefined,
    repaymentSuggestion: claim.claimantResponse?.ccjRequest?.ccjPaymentOption?.type === PaymentOptionType.INSTALMENTS ? claim.claimantResponse?.ccjRequest?.repaymentPlanInstalments?.amount.toString() : undefined,
  };
};
