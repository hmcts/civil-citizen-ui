import {AppRequest} from 'common/mdoels/AppRequest';
import {DashboardClaimantItem, toDraftClaimDashboardItem} from 'models/dashboard/dashboardItem';
import {getDraftClaim} from 'modules/draft-store/draftStoreManagerService';

export interface DraftClaimData {
   claimCreationUrl: string;
   draftClaim: DashboardClaimantItem | null;
}

export const getDraftClaimData = async (req: AppRequest):Promise<DraftClaimData> => {
  const draftUrl = createDraftClaimUrl();
  const draftClaimItem = await getDashboardDraftClaimItem(req);

  return {
    claimCreationUrl: draftUrl,
    draftClaim: draftClaimItem,
  };
};

const createDraftClaimUrl = (): string => {
  return '/eligibility';
};

const getDashboardDraftClaimItem = async (req: AppRequest): Promise<DashboardClaimantItem | null> => {
  const draftResult = await getDraftClaim(req);
  if (!draftResult || !draftResult.claimResponse?.case_data) {
    return null;
  }
  return toDraftClaimDashboardItem(draftResult.claimResponse.case_data);
};
