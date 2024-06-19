import {isMintiEnabled} from '../../app/auth/launchdarkly/launchDarklyClient';
import {isDateOnOrAfterSpecificDate} from 'common/utils/dateUtils';
import config from 'config';

// MINTI release date is set for 31st January 2025
const MINTI_RELEASE_DATE = new Date(config.get<string>('services.mintiDate'));

export async function isMintiEnabledForCase(claimSubmittedDate: Date, mintiReleasedate: Date = MINTI_RELEASE_DATE) {
  const mintiToggleOn = await isMintiEnabled();
  return isDateOnOrAfterSpecificDate(claimSubmittedDate, mintiReleasedate) && mintiToggleOn;
}
