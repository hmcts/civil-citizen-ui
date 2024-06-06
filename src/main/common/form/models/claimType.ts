export const SMALL_CLAIM_AMOUNT = 10000;
export const FAST_TRACK_CLAIM_AMOUNT = 25000;
export const MULTI_TRACK = 100000;

export enum claimType {
  SMALL_CLAIM = 'SMALL_CLAIM',
  FAST_TRACK_CLAIM = 'FAST_TRACK_CLAIM',
  MULTI_TRACK = 'MULTI_TRACK_CLAIM',
}

export function analyseClaimType(totalClaimAmount: number, isMintEnabled = false): claimType {
  totalClaimAmount = 100001;
  if (isMintEnabled){
    if (totalClaimAmount > MULTI_TRACK) {
      return claimType.MULTI_TRACK;
    }
  } else if (totalClaimAmount <= SMALL_CLAIM_AMOUNT) {
    return claimType.SMALL_CLAIM;
  } else if (totalClaimAmount < FAST_TRACK_CLAIM_AMOUNT) {
    return claimType.FAST_TRACK_CLAIM;
  }
}

