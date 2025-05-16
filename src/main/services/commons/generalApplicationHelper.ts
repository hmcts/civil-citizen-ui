import {Claim} from 'models/claim';
import {
  isGaForLipsEnabledAndLocationWhiteListed, isGaForWelshEnabled,
} from '../../app/auth/launchdarkly/launchDarklyClient';
import {CaseState} from 'form/models/claimDetails';

class GaInformation {
  isGAWelsh = false;
  isGaOnline = true;

}

export const isGaOnline = async (claim: Claim): Promise<GaInformation> => {
  const gaInformation = new GaInformation();
  const isSettledOrDiscontinued = claim.ccdState === CaseState.CASE_SETTLED || claim.ccdState === CaseState.CASE_DISCONTINUED;
  const isEaCourt = await isGaForLipsEnabledAndLocationWhiteListed(claim?.caseManagementLocation?.baseLocation);
  if ((claim.defendantUserDetails !== undefined ||
      (claim.isLRDefendant() && !!claim.respondentSolicitorDetails))
    && !isSettledOrDiscontinued) { // when the claims is not yet assign to the defendant and not settled or discontinued
    gaInformation.isGaOnline = false;
  } else if (claim.hasClaimTakenOffline() ||
      claim.hasClaimBeenDismissed()) { // not show the ga link if claim is taken offline or dismissed
    gaInformation.isGaOnline = false;
  } else if (!isEaCourt) { // if the claim is not in EA court, then GA is not online
    gaInformation.isGaOnline = false;
  } else { //is in EA court
    const welshGaEnabled = await isGaForWelshEnabled();
    if (claim.isAnyPartyBilingual() && !welshGaEnabled) { // if the claim is in EA court and any party is bilingual
      gaInformation.isGAWelsh = true;
    } else if (isSettledOrDiscontinued && !claim.previousCCDState) { //when settled or discontinued and no previous state old claims -> ga is offline
      gaInformation.isGaOnline = false;
    }
  }
  return gaInformation;
};
