import {isCUIReleaseTwoEnabled} from '../../app/auth/launchdarkly/launchDarklyClient';
import config from 'config';
import {DashboardClaimantItem, toDraftClaimDashboardItem} from 'models/dashboard/dashboardItem';
import {getOcmcDraftClaims} from 'client/legacyDraftStoreClient';
import {
  getDraftClaimFromStore
} from 'modules/draft-store/draftStoreService';

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
    const claim = await getDraftClaimFromStore(userId);
    return claim.draftClaimCreatedAt ? toDraftClaimDashboardItem(claim.case_data) : undefined;
  }
  return await getOcmcDraftClaims(userToken);

};

