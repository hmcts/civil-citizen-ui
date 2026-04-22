import {DashboardClaimantItem, toDraftClaimDashboardItem} from 'models/dashboard/dashboardItem';
import {getCaseDataFromStore} from 'modules/draft-store/draftStoreService';

export interface DraftClaimData {
   claimCreationUrl: string;
   draftClaim: DashboardClaimantItem
}

export const getDraftClaimData = async (userToken: string, userId:string):Promise<DraftClaimData> => {
  const draftUrl = createDraftClaimUrl();
  const draftClaim = await getDraftClaim(userToken, userId);
  return {
    claimCreationUrl: draftUrl,
    draftClaim: draftClaim,
  };
};

const createDraftClaimUrl = (): string => {
  return '/eligibility';
};

const getDraftClaim = async (_userToken: string, userId: string): Promise<DashboardClaimantItem> => {
  const claim = await getCaseDataFromStore(userId, true);
  return toDraftClaimDashboardItem(claim);
};
