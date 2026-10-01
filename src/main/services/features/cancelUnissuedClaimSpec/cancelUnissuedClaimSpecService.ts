import {Claim} from 'models/claim';
import {CaseState} from 'form/models/claimDetails';
import {isCancelUnissuedClaimSpecEnabled} from '../../../app/auth/launchdarkly/launchDarklyClient';

export const isClaimUnissuedCancelled = (claim: Claim): boolean =>
  claim?.ccdState === CaseState.CLAIM_UNISSUED_CANCELLED;

export const isCancelUnissuedClaimSpecAvailable = async (claim: Claim): Promise<boolean> =>
  !!claim?.isClaimant()
  && claim.ccdState === CaseState.PENDING_CASE_ISSUED
  && await isCancelUnissuedClaimSpecEnabled();
