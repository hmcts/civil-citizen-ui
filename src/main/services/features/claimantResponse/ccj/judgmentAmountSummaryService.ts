import {Claim} from 'models/claim';
import {getInterestData} from 'common/utils/interestUtils';

export const getJudgmentAmountSummary = (claim: Claim, claimFee: number, lang: string) => {
  const hasDefendantAlreadyPaid = claim.hasDefendantPaid();
  const alreadyPaidAmount = hasDefendantAlreadyPaid ? claim.getDefendantPaidAmount() : 0;
  const claimHasInterest = claim.hasInterest();
  const interestDetails = claimHasInterest ? getInterestData(claim, lang) : undefined;
  const totalClaimAmount : number = claim.hasClaimantSettleTheClaimForDefendantPartlyPaidAmount() ? claim.partialAdmissionPaymentAmount() : claim.totalClaimAmount;
  const subTotal = totalClaimAmount + claimFee + (interestDetails ? interestDetails.interestToDate : 0);
  const total = Number(subTotal - alreadyPaidAmount).toFixed(2);

  return {
    hasDefendantAlreadyPaid,
    alreadyPaidAmount,
    claimHasInterest,
    subTotal,
    total,
    ...interestDetails,
  };

};
