import {Claim} from 'models/claim';

export const isCarmApplicableAndSmallClaim = (carmApplicable: boolean, claim: Claim):boolean => carmApplicable && claim.isSmallClaimsTrackDQ;

