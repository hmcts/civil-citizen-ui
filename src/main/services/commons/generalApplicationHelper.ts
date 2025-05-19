import {Claim} from 'models/claim';
import {CaseState} from 'form/models/claimDetails';

export class GaInformation {
  isGAWelsh = false;
  isGaOnline = true;
  isSettledOrDiscontinuedWithPreviousCCDState = false;
}

export const isGaOnline = (claim: Claim, isEaCourt: boolean, isWelshGaEnabled: boolean ): GaInformation => {
  const gaInformation = new GaInformation();
  const isSettledOrDiscontinued = claim.ccdState === CaseState.CASE_SETTLED || claim.ccdState === CaseState.CASE_DISCONTINUED;
  if (claim.isCaseIssuedPending()){
    gaInformation.isGaOnline = false;
  } else if ((claim.defendantUserDetails === undefined ||
      (claim.isLRDefendant() && claim.respondentSolicitorDetails === undefined)) // if the claim is not yet assigned to the defendant
    && !isSettledOrDiscontinued) { // when the claim is not yet assign to the defendant and not settled or discontinued
    gaInformation.isGaOnline = false;
  } else if (claim.hasClaimTakenOffline() ||
      claim.hasClaimBeenDismissed()) { // not show the ga link if claim is taken offline or dismissed
    gaInformation.isGaOnline = false;
  } else if (!isEaCourt) { // if the claim is not in EA court, then GA is not online
    gaInformation.isGaOnline = false;
  } else { //is in EA court
    if (claim.isAnyPartyBilingual() && !isWelshGaEnabled) { // if the claim is in EA court and any party is bilingual
      gaInformation.isGaOnline = false;
      gaInformation.isGAWelsh = true;
    } else if (isSettledOrDiscontinued) {
      if (!claim.previousCCDState){
        gaInformation.isGaOnline = false;
      } else {
        gaInformation.isSettledOrDiscontinuedWithPreviousCCDState = true;
      }
    }
  }
  return gaInformation;
};
