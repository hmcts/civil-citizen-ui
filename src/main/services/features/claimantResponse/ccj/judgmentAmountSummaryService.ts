import {Claim} from 'models/claim';
import {getInterestData} from 'common/utils/interestUtils';

export const getJudgmentAmountSummary = (claim: Claim, claimFee: number, lang: string, url:string) => {
  const hasDefendantAlreadyPaid = claim.hasDefendantPaid();
  const alreadyPaidAmount = hasDefendantAlreadyPaid ? claim.getDefendantPaidAmount() : 0;
  const claimHasInterest = url.includes('county-court-judgement') ? false : claim.hasInterest();
  const interestDetails = claimHasInterest ? getInterestData(claim, lang) : undefined;
  const subTotal = claim.totalClaimAmount + claimFee + (interestDetails ? interestDetails.interestToDate : 0);
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
