import {Claim} from 'models/claim';
import {getInterestData} from 'common/utils/interestUtils';

export const getJudgmentAmountSummary = (claim: Claim, claimFee: number, lang: string) => {
  const hasDefendantAlreadyPaid = claim.hasDefendantPaid();
  const alreadyPaidAmount = hasDefendantAlreadyPaid ? claim.getDefendantPaidAmount().toFixed(2) : 0;
  const claimHasInterest = claim.hasInterest();
  const interestDetails = claimHasInterest ? getInterestData(claim, lang) : undefined;
  const claimSubTotal = claim.totalClaimAmount + claimFee + (interestDetails ? Number(interestDetails.interestToDate) : 0);
  const total = Number(claimSubTotal - Number(alreadyPaidAmount)).toFixed(2);
  const subTotal = claimSubTotal.toFixed(2);
  return {
    hasDefendantAlreadyPaid,
    alreadyPaidAmount,
    claimHasInterest,
    subTotal,
    total,
    ...interestDetails,
  };

};
