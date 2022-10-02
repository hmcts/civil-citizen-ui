import {getCaseDataFromStore} from '../../../modules/draft-store/draftStoreService';
import {SupportRequiredList, SupportRequired} from '../../../common/models/directionsQuestionnaire/supportRequired';

const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('supportRequiredService');

export const getSupportRequired = async (claimId: string): Promise<SupportRequiredList> => {
  try {
    const caseData = await getCaseDataFromStore(claimId);
    return caseData?.directionQuestionnaire?.hearing?.supportRequiredList ?
      caseData.directionQuestionnaire.hearing?.supportRequiredList :
      new SupportRequiredList([new SupportRequired()]);
  } catch (error) {
    logger.error(error);
    throw error;
  }
};
