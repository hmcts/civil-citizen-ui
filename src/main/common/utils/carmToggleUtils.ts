import {isCARMEnabled} from '../../app/auth/launchdarkly/launchDarklyClient';
import {isDateOnOrAfterSpecificDate} from 'common/utils/dateUtils';
import config from 'config';
import {Claim} from 'models/claim';

// CARM release date is set for 1st August 2024
const CARM_RELEASE_DATE = new Date(config.get<string>('services.carmDate'));

export async function isCarmEnabledForCase(claimSubmittedDate: Date, carmDate: Date = CARM_RELEASE_DATE) {
  const isCarmEnabled = await isCARMEnabled();
  return isDateOnOrAfterSpecificDate(claimSubmittedDate, carmDate) && isCarmEnabled;
}

export const isCarmApplicableAndSmallClaim = (carmApplicable: boolean, claim: Claim):boolean => carmApplicable && claim.isSmallClaimsTrackDQ;

