import {Claim} from 'models/claim';
import {getInterestData} from 'common/utils/interestUtils';

export const getJudgmentAmountSummary = (claim: Claim, claimFee: number, lang: string) => {
  const hasDefendantAlreadyPaid = claim.hasDefendantPaid();
  const alreadyPaidAmount = hasDefendantAlreadyPaid ? claim.getDefendantPaidAmount().toFixed(2) : 0;
  const claimHasInterest = claim.hasInterest();
  const interestDetails = claimHasInterest ? getInterestData(claim, lang) : undefined;
  const subTotal = claim.totalClaimAmount + claimFee + (interestDetails ? interestDetails.interestToDate : 0);
  const total = Number(subTotal - Number(alreadyPaidAmount)).toFixed(2);

  return {
    hasDefendantAlreadyPaid,
    alreadyPaidAmount,
    claimHasInterest,
    subTotal,
    total,
    ...interestDetails,
  };

};
