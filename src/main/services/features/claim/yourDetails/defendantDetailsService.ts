import {Claim} from '../../../../common/models/claim';
import {getCaseDataFromStore, saveDraftClaim} from '../../../../modules/draft-store/draftStoreService';
import {Party} from '../../../../common/models/party';

const getDefendantInformation = async (claimId: string): Promise<Party> => {
  const responseData = await getCaseDataFromStore(claimId);
  return (responseData.respondent1) ? responseData.respondent1 : {};
};

/**
 * Save defendant information by updating one or multiple value(s) depending on the saveObject param
 *
 * @param claimId - required - can be either claimId or userId (for screens before claim is created)
 * @param propertyName - optional - used when we want to update one defendant property
 * @param propertyValue - optional - the actual value we want to save in the defendant object,
 * can be either single value or object (such as address object). If propertyValue is an object
 * we need to pass saveObject as true. For more info see defendantDetailsController post
 * @param saveObject - optional - if provided will save propertyValues as object, if updating one property
 * this is not needed
 *
 * @return Promise<void>
 * **/
const saveDefendant = async (claimId: string, propertyName?: string, propertyValue?: any, saveObject?: boolean) => {
  const claim = await getCaseDataFromStore(claimId) || new Claim();
  if (!claim.respondent1) {
    claim.respondent1 = new Party();
  }

  (saveObject) ?
    claim.respondent1 = {...claim.respondent1, ...propertyValue} :
    claim.respondent1[propertyName as keyof Party] = propertyValue;
  await saveDraftClaim(claimId, claim);
};

export {
  getDefendantInformation,
  saveDefendant,
};
