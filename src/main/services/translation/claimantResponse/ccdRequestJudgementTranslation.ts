import { YesNo } from 'common/form/models/yesNo';
import { Claim } from 'common/models/claim';
import { toCCDYesNo } from '../response/convertToCCDYesNo';
import { calculateInterestToDate } from 'common/utils/interestUtils';
import { CCDClaim } from 'common/models/civilClaimResponse';

export interface ClaimantResponseRequestDefaultJudgementToCCD extends CCDClaim {
  ccjPaymentPaidSomeOption: string,
  ccjPaymentPaidSomeAmount: string,
  ccjJudgmentAmountClaimFee: string,
  ccjJudgmentLipInterest: string,
}

export const translateClaimantResponseRequestDefaultJudgementToCCD = (claim: Claim, claimFee: number): ClaimantResponseRequestDefaultJudgementToCCD => {
  const ccjClaimantResponse = claim.claimantResponse;
  const ccjPaymentPaidSomeAmount = ccjClaimantResponse?.ccjRequest?.paidAmount?.option === YesNo.YES ? (ccjClaimantResponse?.ccjRequest?.paidAmount?.amount * 100).toString() : null;
  const ccjJudgmentLipInterest = calculateInterestToDate(claim) || 0;
  return {
    ccjPaymentPaidSomeOption: toCCDYesNo(ccjClaimantResponse?.ccjRequest?.paidAmount?.option),
    ccjPaymentPaidSomeAmount,
    ccjJudgmentAmountClaimFee: claimFee.toString(),
    ccjJudgmentLipInterest: ccjJudgmentLipInterest.toString(),
  };
};
