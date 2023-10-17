import {isCUIReleaseTwoEnabled} from '../../app/auth/launchdarkly/launchDarklyClient';
import config from 'config';
import {DashboardClaimantItem, toDraftClaimDashboardItem} from 'models/dashboard/dashboardItem';
import {getOcmcDraftClaims} from 'client/legacyDraftStoreClient';
import {getCaseDataFromStore} from 'modules/draft-store/draftStoreService';

const ocmcBaseUrl = config.get<string>('services.cmc.url');

export interface DraftClaimData {
   claimCreationUrl: string;
   draftClaim: DashboardClaimantItem
}

export const getDraftClaimData = async (userToken: string, userId:string):Promise<DraftClaimData> => {
  const isReleaseTwoEnabled = await isCUIReleaseTwoEnabled();
  const draftUrl = createDraftClaimUrl(isReleaseTwoEnabled);
  const draftClaim = await getDraftClaim(userToken, userId, isReleaseTwoEnabled);
  return {
    claimCreationUrl: draftUrl,
    draftClaim: draftClaim,
  };
};

const createDraftClaimUrl =  (isReleaseTwoEnabled : boolean):string => {
  const eligibility = '/eligibility';
  if(isReleaseTwoEnabled) {
    return eligibility;
  }
  return `${ocmcBaseUrl}/eligibility`;
};

const getDraftClaim = async (userToken: string, userId: string, isReleaseTwoEnabled : boolean): Promise<DashboardClaimantItem> => {
  if(isReleaseTwoEnabled) {
    const claim = await getCaseDataFromStore(userId, true);
    return toDraftClaimDashboardItem(claim);
  }
  return await getOcmcDraftClaims(userToken);
};
