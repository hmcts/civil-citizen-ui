import {getCaseDataFromStore, saveDraftClaim} from 'modules/draft-store/draftStoreService';
import {Party} from 'models/party';

export const getRespondentInformation = async (claimId: string): Promise<Party> => {
  const responseData = await getCaseDataFromStore(claimId);
  if (responseData.respondent1) {
    return responseData.respondent1;
  }
  return new Party();
};
//TODO remove that method and use saveDefendantProperty
export const saveRespondent = async (claimId: string, party: Party): Promise<void> => {
  const responseData = await getCaseDataFromStore(claimId);
  if (!responseData.respondent1) {
    responseData.respondent1 = new Party();
  }
  responseData.respondent1.partyDetails.primaryAddress = party?.partyDetails.primaryAddress;
  responseData.respondent1.partyDetails.correspondenceAddress = party?.partyDetails.correspondenceAddress;
  responseData.respondent1.partyPhone = party?.partyPhone;
  responseData.respondent1.partyDetails.contactPerson = party?.partyDetails.contactPerson;
  responseData.respondent1.partyDetails.postToThisAddress = party?.partyDetails.postToThisAddress;

  await saveDraftClaim(claimId, responseData);
};

export const saveDefendantProperty = async (userId: string, propertyName: string, value: any): Promise<void> => {
  const claim = await getCaseDataFromStore(userId);
  if (claim.respondent1) {
    claim.respondent1[propertyName as keyof Party] = value;
  } else {
    const claimant = new Party();
    claimant[propertyName as keyof Party] = value;
    claim.respondent1 = claimant;
  }
  await saveDraftClaim(userId, claim);
};
