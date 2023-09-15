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

export const getDraftClaimData = async (userToken: string):Promise<DraftClaimData> => {
  const isReleaseTwoEnabled = await isCUIReleaseTwoEnabled();
  const isTempFlagEnabled = await isCUIReleaseTwoEnabled();
  const draftUrl = createDraftClaimUrl(isReleaseTwoEnabled);
  console.log('----draft-claim---url----', isReleaseTwoEnabled, draftUrl);
  console.log('----tempflag----', isTempFlagEnabled);
  const draftClaim = await getDraftClaim(userToken, isReleaseTwoEnabled);
  console.log('----getDraftClaimData----', draftClaim);
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
const getDraftClaim = async (userToken: string, isReleaseTwoEnabled : boolean): Promise<DashboardClaimantItem> => {
  if(isReleaseTwoEnabled) {
    const claim = await getCaseDataFromStore(userToken);
    return toDraftClaimDashboardItem(claim);
  }
  return await getOcmcDraftClaims(userToken);

};

