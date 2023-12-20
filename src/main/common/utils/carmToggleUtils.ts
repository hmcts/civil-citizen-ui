import config from 'config';

// CARM release date is set for 1st May 2024
const CARM_RELEASE_DATE = new Date(config.get<string>('services.carmDate'));

export async function isCarmEnabledForCase(claimSubmittedDate: Date, carmDate: Date = CARM_RELEASE_DATE) {
  // const isCarmEnabled = await isCARMEnabled();
  // return isDateOnOrAfterSpecificDate(claimSubmittedDate, carmDate) && isCarmEnabled;
  return true;
}
