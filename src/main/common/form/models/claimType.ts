export const SMALL_CLAIM_AMOUNT = 10000;
export const FAST_TRACK_CLAIM_AMOUNT = 25000;
export const MULTI_TRACK = 100000;

export enum claimType {
  SMALL_CLAIM = 'SMALL_CLAIM',
  FAST_TRACK_CLAIM = 'FAST_TRACK_CLAIM',
  FAST_CLAIM = 'FAST_CLAIM',
  INTERMEDIATE_TRACK_CLAIM = 'INTERMEDIATE_TRACK_CLAIM',
  MULTI_TRACK = 'MULTI_CLAIM',
}

export function analyseClaimType(totalClaimAmount: number, isMintiEnabled = false): claimType {
  if (isMintiEnabled) {
    if (totalClaimAmount > FAST_TRACK_CLAIM_AMOUNT && totalClaimAmount <= MULTI_TRACK) {
      return claimType.INTERMEDIATE_TRACK_CLAIM;
    } else if (totalClaimAmount > MULTI_TRACK) {
      return claimType.MULTI_TRACK;
    }
  }

  if (totalClaimAmount <= SMALL_CLAIM_AMOUNT) {
    return claimType.SMALL_CLAIM;
  } else if (totalClaimAmount <= FAST_TRACK_CLAIM_AMOUNT) {
    return claimType.FAST_TRACK_CLAIM;
  }
}

export const isMultiTrack = (totalClaimAmount: number, isMintiEnabled = false): boolean =>
  analyseClaimType(totalClaimAmount, isMintiEnabled) === claimType.MULTI_TRACK;

export const isIntermediateTrack = (totalClaimAmount: number, isMintiEnabled = false): boolean =>
  analyseClaimType(totalClaimAmount, isMintiEnabled) === claimType.INTERMEDIATE_TRACK_CLAIM;
