import {Claim} from 'models/claim';
import {CaseState} from 'form/models/claimDetails';

export class GaInformation {
  isGAWelsh = false;
  isGaOnline = true;
  isSettledOrDiscontinuedWithPreviousCCDState = false;
}

export const isGaOnline = (claim: Claim, isEaCourt: boolean, isWelshGaEnabled: boolean): GaInformation => {
  const gaInformation = new GaInformation();
  const isSettledOrDiscontinued = claim.ccdState === CaseState.CASE_SETTLED || claim.ccdState === CaseState.CASE_DISCONTINUED;
  if (claim.isCaseIssuedPending() ||
      claim.hasClaimTakenOffline() ||
      claim.hasClaimBeenDismissed() ||
      !isEaCourt) { // if the claim is not yet issued
    gaInformation.isGaOnline = false;
    return gaInformation;
  }

  if (isSettledOrDiscontinued) { // if the claim is settled or discontinued
    if (!claim.previousCCDState) { // if the claim is settled or discontinued and previous CCD state is undefined
      gaInformation.isGaOnline = false;
      return gaInformation;
    } else {
      gaInformation.isSettledOrDiscontinuedWithPreviousCCDState = true; // in the case that all the application's tasklist are inactive
    }
  }
  // if the claim is in EA court and not yet assigned to the defendant or not settled or discontinued
  if (isEaCourt) {
    if ((claim.defendantUserDetails === undefined ||
            (claim.isLRDefendant() && claim.respondentSolicitorDetails === undefined)) // if the claim is not yet assigned to the defendant and not settled or discontinued
        && !isSettledOrDiscontinued) {
      gaInformation.isGaOnline = false;
      return gaInformation;
    }
    if (claim.isAnyPartyBilingual() && !isWelshGaEnabled) { // if the claim is in EA court and any party is bilingual
      gaInformation.isGaOnline = false;
      gaInformation.isGAWelsh = true;
      return gaInformation;
    }
  }
  return gaInformation;
};
