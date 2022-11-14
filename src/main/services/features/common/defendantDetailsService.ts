import {getCaseDataFromStore, saveDraftClaim} from '../../../modules/draft-store/draftStoreService';
import {Party} from '../../../common/models/party';

const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('defendantDetailsService');

export const getDefendantInformation = async (claimId: string): Promise<Party> => {
  const responseData = await getCaseDataFromStore(claimId);
  if (responseData.respondent1) {
    return responseData.respondent1;
  }
  return new Party();
};

export const saveDefendantProperty = async (userId: string, propertyName: string, value: any): Promise<void> => {
  try {
    const claim = await getCaseDataFromStore(userId);
    if (claim?.respondent1) {
      claim.respondent1[propertyName as keyof Party] = value;
    } else {
      const claimant = new Party();
      claimant[propertyName as keyof Party] = value;
      claim.respondent1 = claimant;
    }
    await saveDraftClaim(userId, claim);
  } catch (error) {
    logger.error(error);
    throw error;
  }
};
