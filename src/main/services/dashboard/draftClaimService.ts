import {isCUIReleaseTwoEnabled} from '../../app/auth/launchdarkly/launchDarklyClient';
import config from 'config';
import {DashboardClaimantItem, toDashboardItem} from 'models/dashboard/dashboardItem';
import {getOcmcDraftClaims} from 'client/legacyDraftStoreClient';
import {getDraftClaimFromStore} from 'modules/draft-store/draftStoreService';

const ocmcBaseUrl = config.get<string>('services.cmc.url');

export const createDraftClaimUrl = () => {
  const eligibility = '/eligibility';
  if(isReleaseTwo()) {
    return eligibility;
  }
  return `${ocmcBaseUrl}/eligibility`;
};

export const getDraftClaim = async (userToken: string): Promise<DashboardClaimantItem> => {
  if(isReleaseTwo()) {
    const claim = await getDraftClaimFromStore(userToken);
    return toDashboardItem(claim);
  }
  return await getOcmcDraftClaims(userToken);

};

const isReleaseTwo = () => {
  return (async ()=> {
    await isCUIReleaseTwoEnabled();
  });
};
