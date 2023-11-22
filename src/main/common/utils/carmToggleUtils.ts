import {isCARMEnabled} from '../../app/auth/launchdarkly/launchDarklyClient';
import {isDateOnOrAfterSpecificDate} from 'common/utils/dateUtils';

// CARM release date is set for 1st May 2024
const CARM_RELEASE_DATE = new Date(2022, 4, 1);

export async function isCarmEnabledForCase(claimSubmittedDate: Date, carmDate: Date = CARM_RELEASE_DATE) {
  const isCarmEnabled = await isCARMEnabled();

  console.log();
  console.log('FILE: carmToggleUtils.ts');
  console.log('FUNCTION: isCarmEnabledForCase()');
  console.log('VALUES: ');
  console.log('claimSubmittedDate: ' + claimSubmittedDate);
  console.log('carmDate: ' + carmDate);
  console.log('isCARMEnabled: ' + isCarmEnabled);
  console.log('isDateOnOrAfterSpecificDate(): ' + isDateOnOrAfterSpecificDate(claimSubmittedDate, carmDate));

  return isDateOnOrAfterSpecificDate(claimSubmittedDate, carmDate) && isCarmEnabled;
}
