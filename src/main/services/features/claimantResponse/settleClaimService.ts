import { Claim } from 'common/models/claim';

export const getPaidAmount = (claim: Claim) => {
  if (claim.isFullDefence()) {
    return claim.isRejectAllOfClaimAlreadyPaid();
  }
  if (claim.isPartialAdmissionPaid()) {
    return claim.partialAdmissionPaidAmount();
  }
};

export const getClaimSettled = (claim: Claim) => {
  if (claim.isFullDefence() && claim.hasPaidInFull()) {
    return claim.claimantResponse?.hasFullDefenceStatesPaidClaimSettled;
  }

  if (claim.isPartialAdmissionPaid()) {
    return claim.claimantResponse?.hasPartPaymentBeenAccepted;
  }
};