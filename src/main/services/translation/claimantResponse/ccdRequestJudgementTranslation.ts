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
import { ClaimantResponse } from 'common/models/claimantResponse';

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
  const claimantResponse = Object.assign(new ClaimantResponse(),claim.claimantResponse);
  const claimantAcceptedpaidAmount = claimantResponse.ccjRequest?.paidAmount;
  const ccjPaymentPaidSomeAmount = claimantAcceptedpaidAmount?.option === YesNo.YES ? (claimantAcceptedpaidAmount?.amount * 100).toString() : null;
  const ccjJudgmentLipInterest = calculateInterestToDate(claim) || 0;
  return {
    ccjPaymentPaidSomeOption: toCCDYesNo(claimantAcceptedpaidAmount?.option),
    ccjPaymentPaidSomeAmount,
    ccjJudgmentAmountClaimFee: claimFee.toString(),
    ccjJudgmentLipInterest: ccjJudgmentLipInterest.toString(),
    partialPayment: toCCDYesNo(claimantResponse.ccjRequest?.paidAmount?.option),
    partialPaymentAmount: claimantResponse.ccjRequest?.paidAmount?.option === YesNo.YES ? convertToPence(claimantResponse.ccjRequest?.paidAmount?.amount).toString() : undefined,
    paymentTypeSelection: toCCDDJPaymentOption(claimantResponse.ccjRequest?.ccjPaymentOption?.type),
    paymentSetDate: claimantResponse.ccjRequest?.ccjPaymentOption?.type === PaymentOptionType.BY_SET_DATE ? claimantResponse.ccjRequest?.defendantPaymentDate?.date : undefined,
    repaymentFrequency: claimantResponse.ccjRequest?.ccjPaymentOption?.type === PaymentOptionType.INSTALMENTS ? toCCDDJPaymentFrequency(claimantResponse.ccjRequest?.repaymentPlanInstalments?.paymentFrequency) : undefined,
    repaymentDue:claimantResponse.ccjRequest?.paidAmount?.option === YesNo.YES ? (claimantResponse.ccjRequest?.paidAmount?.totalAmount - claimantResponse.ccjRequest?.paidAmount?.amount).toString() : undefined,
    repaymentSuggestion: claimantResponse.ccjRequest?.ccjPaymentOption?.type === PaymentOptionType.INSTALMENTS ? claimantResponse.ccjRequest?.repaymentPlanInstalments?.amount.toString() : undefined,
  };
};
