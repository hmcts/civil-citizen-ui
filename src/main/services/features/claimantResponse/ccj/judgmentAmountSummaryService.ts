import {Claim} from 'models/claim';
import {getInterestData} from 'common/utils/interestUtils';

export const getJudgmentAmountSummary = async (claim: Claim, claimFee: number, lang: string) => {
  const hasDefendantAlreadyPaid = claim.hasDefendantPaid();
  const alreadyPaidAmount = hasDefendantAlreadyPaid ? claim.getDefendantPaidAmount().toFixed(2) : 0;
  const isFullAdmission = claim.isFullAdmission();
  const isChargeableInterest = isFullAdmission || ( claim.isDefendantNotResponded() && claim.isDeadLinePassed());
  const claimHasInterest = isChargeableInterest && claim.hasInterest();
  const interestDetails = claimHasInterest ? await getInterestData(claim, lang) : undefined;
  const claimFeeAmount = claim.helpWithFees?.helpWithFeesReferenceNumber ? Number(claim.claimIssuedHwfDetails.outstandingFeeInPounds) : claimFee;
  const claimAmountAccepted : number = claim.hasClaimantAcceptedDefendantAdmittedAmount() ? claim.partialAdmissionPaymentAmount() : claim.totalClaimAmount;
  const claimSubTotal = claimAmountAccepted + claimFeeAmount + (interestDetails ? Number(interestDetails.interestToDate) : 0);
  const total = (claimSubTotal - Number(alreadyPaidAmount)).toFixed(2);
  const totalWithoutFeeAndInterest = (claimAmountAccepted - Number(alreadyPaidAmount)).toFixed(2);

  const subTotal = claimSubTotal.toFixed(2);
  return {
    hasDefendantAlreadyPaid,
    alreadyPaidAmount,
    claimFeeAmount,
    claimHasInterest,
    subTotal,
    total,
    isFullAdmission,
    isChargeableInterest,
    totalWithoutFeeAndInterest,
    ...interestDetails,
  };
};
