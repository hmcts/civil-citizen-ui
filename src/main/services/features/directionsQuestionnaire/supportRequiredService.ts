import {getCaseDataFromStore} from '../../../modules/draft-store/draftStoreService';
import {SupportRequired} from '../../../common/models/directionsQuestionnaire/supportRequired';

const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('supportRequiredService');

export const getSupportRequired = async (claimId: string): Promise<SupportRequired> => {
  try {
    const caseData = await getCaseDataFromStore(claimId);
    return caseData?.directionQuestionnaire?.supportRequired ?
      caseData.directionQuestionnaire.supportRequired :
      new SupportRequired();
  } catch (error) {
    logger.error(error);
    throw error;
  }
};
