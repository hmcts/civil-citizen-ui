import {Claim} from 'models/claim';
import {CaseState} from 'form/models/claimDetails';

export const isUnissuedClaimCancelled = (claim: Claim): boolean =>
  claim?.ccdState === CaseState.UNISSUED_CLAIM_CANCELLED;

export const isCancelUnissuedClaimAvailable = (claim: Claim): boolean =>
  !!claim?.isClaimant() && claim.ccdState === CaseState.PENDING_CASE_ISSUED;
