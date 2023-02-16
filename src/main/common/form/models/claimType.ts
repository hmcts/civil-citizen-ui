const SMALL_CLAIM_AMOUNT = 10000;
const FAST_TRACK_CLAIM_AMOUNT = 25000;

export enum claimType {
  SMALL_CLAIM = 'SMALL_CLAIM',
  FAST_TRACK_CLAIM = 'FAST_TRACK_CLAIM',
}

export function analyseClaimType(totalClaimAmount: number): claimType {
  if (totalClaimAmount <= SMALL_CLAIM_AMOUNT) {
    return claimType.SMALL_CLAIM;
  } else if (totalClaimAmount < FAST_TRACK_CLAIM_AMOUNT) {
    return claimType.FAST_TRACK_CLAIM;
  }
}
