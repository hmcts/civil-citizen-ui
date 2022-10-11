import {Claim} from '../../../../common/models/claim';
import {getCaseDataFromStore, saveDraftClaim} from '../../../../modules/draft-store/draftStoreService';
import {Party} from '../../../../common/models/party';

const getDefendantInformation = async (claimId: string): Promise<Party> => {
  const responseData = await getCaseDataFromStore(claimId);
  return (responseData?.respondent1) ? responseData.respondent1 : {};
};

const saveDefendant = async (claimId: string, propertyName: string, propertyValue: any) => {
  const claim = await getCaseDataFromStore(claimId) || new Claim();
  if (!claim.respondent1) {
    claim.respondent1 = new Party();
  }
  claim.respondent1[propertyName as keyof Party] = propertyValue;

  await saveDraftClaim(claimId, claim);
};

export {
  getDefendantInformation,
  saveDefendant,
};
