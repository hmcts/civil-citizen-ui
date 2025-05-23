import {Claim} from 'models/claim';

export const getJudgmentAmountSummary = async (claim: Claim, claimFee: number, lang: string) => {
  const hasDefendantAlreadyPaid = claim.hasDefendantPaid();
  const alreadyPaidAmount = hasDefendantAlreadyPaid ? claim.getDefendantPaidAmount().toFixed(2) : 0;
  const claimFeeAmount = claim.helpWithFees?.helpWithFeesReferenceNumber ? Number(claim.claimIssuedHwfDetails.outstandingFeeInPounds) : claimFee;
  const claimAmountAccepted : number = claim.hasClaimantAcceptedDefendantAdmittedAmount() ? claim.partialAdmissionPaymentAmount() : claim.totalClaimAmount;
  const claimSubTotal = claimAmountAccepted + claimFeeAmount;
  const total = (claimSubTotal - Number(alreadyPaidAmount)).toFixed(2);
  const subTotal = claimSubTotal.toFixed(2);
  return {
    hasDefendantAlreadyPaid,
    alreadyPaidAmount,
    claimFeeAmount,
    subTotal,
    total,
  };
};
