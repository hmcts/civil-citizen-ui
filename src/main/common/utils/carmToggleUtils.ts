import {isCARMEnabled} from '../../app/auth/launchdarkly/launchDarklyClient';
import {isDateOnOrAfterSpecificDate} from 'common/utils/dateUtils';

// CARM release date is set for 1st May 2024
const CARM_RELEASE_DATE = new Date(2023, 4, 1);

export async function isCarmEnabledForCase(claimSubmittedDate: Date, carmDate: Date = CARM_RELEASE_DATE) {
  const isCarmEnabled = await isCARMEnabled();
  return isDateOnOrAfterSpecificDate(claimSubmittedDate, carmDate) && isCarmEnabled;
}
