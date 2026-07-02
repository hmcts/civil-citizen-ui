import {Claim} from 'models/claim';
import {CaseState} from 'form/models/claimDetails';
import {
  isCuiGaNroEnabled,
  isGaForLipsEnabledAndLocationWhiteListed,
} from '../../app/auth/launchdarkly/launchDarklyClient';
import {APPLICATION_TYPE_URL, QM_INFORMATION_URL} from 'routes/urls';
import {QualifyingQuestionTypeOption, WhatToDoTypeOption} from 'form/models/queryManagement/queryManagement';
import {LinKFromValues} from 'models/generalApplication/applicationType';

export class GaInformation {
  isGaOnline = true;
  isSettledOrDiscontinuedWithPreviousCCDState = false;
}

export const isGaOnline = (claim: Claim, isEaCourt: boolean, isNroForGaLip: boolean): GaInformation => {
  const gaInformation = new GaInformation();
  const isSettledOrDiscontinued = claim.ccdState === CaseState.CASE_SETTLED || claim.ccdState === CaseState.CASE_DISCONTINUED;
  if (claim.isCaseIssuedPending() ||
      claim.hasClaimTakenOffline() ||
      claim.hasClaimBeenDismissed() ||
    (!isEaCourt && !isNroForGaLip)) { // if the claim is not yet issued
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
  if (isEaCourt || isNroForGaLip) {
    if (((!claim.isLRDefendant() && claim.defendantUserDetails === undefined) ||
            (claim.isLRDefendant() && claim.respondentSolicitorDetails === undefined)) // if the claim is not yet assigned to the defendant and not settled or discontinued
        && !isSettledOrDiscontinued) {
      gaInformation.isGaOnline = false;
      return gaInformation;
    }
  }
  return gaInformation;
};

export const getGaRedirectionUrl = async (claim: Claim, isAskMoreTime = false, isAdjournHearing = false, isAmendClaim = false) => {
  const isEaCourt = await isGaForLipsEnabledAndLocationWhiteListed(claim?.caseManagementLocation?.baseLocation);
  const isNroForGaLip = await isCuiGaNroEnabled();
  const isGAInfo = isGaOnlineQM(claim, isEaCourt, isNroForGaLip);
  if (!isGAInfo.isGaOnline) {
    return QM_INFORMATION_URL.replace(':qmType', WhatToDoTypeOption.CHANGE_CASE).replace(':qmQualifyOption', QualifyingQuestionTypeOption.GA_OFFLINE);
  }
  const url = APPLICATION_TYPE_URL + `?linkFrom=${LinKFromValues.start}` +
    (isAskMoreTime ? '&isAskMoreTime=true' : '') +
    (isAdjournHearing ? '&isAdjournHearing=true' : '') +
    (isAmendClaim ? '&isAmendClaim=true' : '');

  return url.trim();
};

export const isGaOnlineQM = (claim: Claim, isEaCourt: boolean, isNroForGaLip: boolean): GaInformation => {
  const gaInformation = new GaInformation();
  const isSettled = claim.ccdState === CaseState.CASE_SETTLED;
  if (claim.isCaseIssuedPending() ||
      claim.hasClaimTakenOffline() ||
      claim.hasClaimBeenDismissed() ||
    (!isEaCourt && !isNroForGaLip)) { // if the claim is not yet issued
    gaInformation.isGaOnline = false;
    return gaInformation;
  }

  if (isEaCourt || isNroForGaLip) {
    if ((!claim.isLRDefendant() && claim.defendantUserDetails === undefined) ||
      (claim.isLRDefendant() && claim.respondentSolicitorDetails === undefined)) { // if the claim is not yet assigned to the defendant
      gaInformation.isGaOnline = isSettled; // if the claim is settled, then GA is online
      return gaInformation;
    }
  }

  return gaInformation;
};
