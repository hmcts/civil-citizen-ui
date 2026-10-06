import {Claim} from 'models/claim';
import {CaseState} from 'form/models/claimDetails';

export const isClaimUnissuedCancelled = (claim: Claim): boolean =>
  claim?.ccdState === CaseState.CLAIM_UNISSUED_CANCELLED;

export const isCancelUnissuedClaimSpecAvailable = (claim: Claim): boolean =>
  !!claim?.isClaimant() && claim.ccdState === CaseState.PENDING_CASE_ISSUED;
