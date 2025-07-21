import {Claim} from 'models/claim';
import {CaseState} from 'form/models/claimDetails';
import {
  isGaForLipsEnabledAndLocationWhiteListed,
  isGaForWelshEnabled,
} from '../../app/auth/launchdarkly/launchDarklyClient';
import {APPLICATION_TYPE_URL, GA_SUBMIT_OFFLINE, QM_INFORMATION_URL} from 'routes/urls';
import {QualifyingQuestionTypeOption, WhatToDoTypeOption} from 'form/models/queryManagement/queryManagement';
import {LinKFromValues} from 'models/generalApplication/applicationType';

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

export const getGaRedirectionUrl = async (claim: Claim, isAskMoreTime = false, isAdjournHearing = false, isAmendClaim = false) => {
  const isEaCourt = await isGaForLipsEnabledAndLocationWhiteListed(claim?.caseManagementLocation?.baseLocation);
  const welshGaEnabled = await isGaForWelshEnabled();
  const isGAInfo = isGaOnlineQM(claim, isEaCourt, welshGaEnabled);
  console.log('IS EA COURT {}', isEaCourt);
  console.log('WELSH ENABLED {}', welshGaEnabled);
  console.log('GA ONLINE {}', isGAInfo.isGaOnline);
  console.log('GA GA WELSH  {}', isGAInfo.isGAWelsh);
  console.log('IS SETTLED/DISCONTINUED {}', isGAInfo.isSettledOrDiscontinuedWithPreviousCCDState);
  if (isGAInfo.isGAWelsh) {
    return GA_SUBMIT_OFFLINE;
  } else if (!isGAInfo.isGaOnline) {
    return QM_INFORMATION_URL.replace(':qmType', WhatToDoTypeOption.CHANGE_CASE).replace(':qmQualifyOption', QualifyingQuestionTypeOption.GA_OFFLINE);
  }
  const url = APPLICATION_TYPE_URL + `?linkFrom=${LinKFromValues.start}` +
    (isAskMoreTime ? '&isAskMoreTime=true' : '') +
    (isAdjournHearing ? '&isAdjournHearing=true' : '') +
    (isAmendClaim ? '&isAmendClaim=true' : '');

  return url.trim();
};

export const isGaOnlineQM = (claim: Claim, isEaCourt: boolean, isWelshGaEnabled: boolean): GaInformation => {
  const gaInformation = new GaInformation();
  const isSettled = claim.ccdState === CaseState.CASE_SETTLED;
  if (claim.isCaseIssuedPending() ||
      claim.hasClaimTakenOffline() ||
      claim.hasClaimBeenDismissed() ||
      !isEaCourt) { // if the claim is not yet issued
    gaInformation.isGaOnline = false;
    return gaInformation;
  }

  if (isEaCourt) {
    if (claim.defendantUserDetails != undefined && !claim.isLRDefendant() && !claim.isAnyPartyBilingual()) {
      // if the is assigned to the defendant, not LR, not bilingual
      console.log('IS EA COURT, DEFENDANT DEFINED, NO BILGINGUAL');
      gaInformation.isGaOnline = true;
      return gaInformation;
    }
    if ((claim.defendantUserDetails === undefined ||
      (claim.isLRDefendant() && claim.respondentSolicitorDetails === undefined))) { // if the claim is not yet assigned to the defendant
      console.log('IS EA COURT, DEFENDANT NOT DEFINED');
      gaInformation.isGaOnline = isSettled; // if the claim is settled, then GA is online
      return gaInformation;
    }
    if (claim.isAnyPartyBilingual() && !isWelshGaEnabled) { // if the claim is in EA court and any party is bilingual
      console.log('IS EA COURT, BILGINGUAL, !isWelshGaEnabled');
      gaInformation.isGaOnline = false;
      gaInformation.isGAWelsh = true;
      return gaInformation;
    }
  }

  console.log('GA Information:', JSON.stringify(gaInformation));

  console.log('Type:', typeof gaInformation.isGaOnline);

  return gaInformation;
};
