import {AppRequest} from 'common/models/AppRequest';
import {DashboardClaimantItem, toDraftClaimDashboardItem} from 'models/dashboard/dashboardItem';
import {Claim} from 'models/claim';
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
  const claim = new Claim();
  Object.assign(claim, draftResult.claimResponse.case_data);
  claim.draftClaimCreatedAt = new Date(draftResult.createdAt);
  return toDraftClaimDashboardItem(claim) ?? null;
};
