import {getCaseDataFromStore, saveDraftClaim} from 'modules/draft-store/draftStoreService';
import {Party} from 'models/party';

export const getClaimantInformation = async (claimId: string): Promise<Party> => {
  const responseData = await getCaseDataFromStore(claimId);
  return Object.assign(new Party(), responseData?.applicant1);
};

export const saveClaimantProperty = async (userId: string, propertyName: string, value: any): Promise<void> => {
  const claim = await getCaseDataFromStore(userId);
  if (claim.applicant1) {
    claim.applicant1[propertyName as keyof Party] = value;
  } else {
    const claimant = new Party();
    claimant[propertyName as keyof Party] = value;
    claim.applicant1 = claimant;
  }
  await saveDraftClaim(userId, claim);
};
