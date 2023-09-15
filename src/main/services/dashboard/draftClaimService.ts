import {isCUIReleaseTwoEnabled, isCuitempflag} from '../../app/auth/launchdarkly/launchDarklyClient';
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
  const isTempFlagEnabled = await isCuitempflag();
  const draftUrl = createDraftClaimUrl(isReleaseTwoEnabled);
  console.log('----draft-claim---url----', isReleaseTwoEnabled, draftUrl);
  console.log('----tempflag-dashboard---', isTempFlagEnabled);
  const draftClaim = await getDraftClaim(userToken, isReleaseTwoEnabled);
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

