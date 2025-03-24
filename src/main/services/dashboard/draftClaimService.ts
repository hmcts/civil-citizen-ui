import {DashboardClaimantItem, toDraftClaimDashboardItem} from 'models/dashboard/dashboardItem';
import {getCaseDataFromStore} from 'modules/draft-store/draftStoreService';

export interface DraftClaimData {
   claimCreationUrl: string;
   draftClaim: DashboardClaimantItem
}

export const getDraftClaimData = async (userToken: string, userId:string):Promise<DraftClaimData> => {
  const draftUrl = '/eligibility';
  const draftClaim = await getDraftClaim(userToken, userId);
  return {
    claimCreationUrl: draftUrl,
    draftClaim: draftClaim,
  };
};

const getDraftClaim = async (userToken: string, userId: string): Promise<DashboardClaimantItem> => {
  const claim = await getCaseDataFromStore(userId, true);
  return toDraftClaimDashboardItem(claim);
};
