import {isCUIReleaseTwoEnabled} from '../../app/auth/launchdarkly/launchDarklyClient';
import config from 'config';
import {DashboardClaimantItem, toDashboardItem} from 'models/dashboard/dashboardItem';
import {getOcmcDraftClaims} from 'client/legacyDraftStoreClient';
import {getCaseDataFromStore} from 'modules/draft-store/draftStoreService';

const ocmcBaseUrl = config.get<string>('services.cmc.url');

export const createDraftClaimUrl = async ():Promise<string> => {
  const eligibility = '/eligibility';
  const isReleaseTwoEnabled = await isCUIReleaseTwoEnabled();
  if(isReleaseTwoEnabled) {
    return eligibility;
  }
  return `${ocmcBaseUrl}/eligibility`;
};

export const getDraftClaim = async (userToken: string): Promise<DashboardClaimantItem> => {
  const isReleaseTwoEnabled = await isCUIReleaseTwoEnabled();
  console.log(isReleaseTwoEnabled);
  if(isReleaseTwoEnabled) {
    const claim = await getCaseDataFromStore(userToken);
    return toDashboardItem(claim);
  }
  return await getOcmcDraftClaims(userToken);

};

