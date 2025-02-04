import {Claim} from 'models/claim';
import {getInterestData} from 'common/utils/interestUtils';
import {AppRequest} from 'models/AppRequest';

export const getJudgmentAmountSummary = async (claim: Claim, claimFee: number, lang: string, req: AppRequest) => {
  const hasDefendantAlreadyPaid = claim.hasDefendantPaid();
  const alreadyPaidAmount = hasDefendantAlreadyPaid ? claim.getDefendantPaidAmount().toFixed(2) : 0;
  const claimHasInterest = claim.hasInterest();
  const interestDetails = claimHasInterest ? await getInterestData(claim, lang, req) : undefined;
  const claimFeeAmount = claim.helpWithFees?.helpWithFeesReferenceNumber ? Number(claim.claimIssuedHwfDetails.outstandingFeeInPounds) : claimFee;
  const claimAmountAccepted : number = claim.hasClaimantAcceptedDefendantAdmittedAmount() ? claim.partialAdmissionPaymentAmount() : claim.totalClaimAmount;
  const claimSubTotal = claimAmountAccepted + claimFeeAmount + (interestDetails ? Number(interestDetails.interestToDate) : 0);
  const total = (claimSubTotal - Number(alreadyPaidAmount)).toFixed(2);
  const subTotal = claimSubTotal.toFixed(2);
  return {
    hasDefendantAlreadyPaid,
    alreadyPaidAmount,
    claimFeeAmount,
    claimHasInterest,
    subTotal,
    total,
    ...interestDetails,
  };
};
