import {getCaseDataFromStore, saveDraftClaim} from '../../../modules/draft-store/draftStoreService';
import {SupportRequired} from '../../../common/models/directionsQuestionnaire/supportRequired';
import {DirectionQuestionnaire} from '../../../common/models/directionsQuestionnaire/directionQuestionnaire';

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

export const saveSupportRequired = async (claimId: string, supportRequired: SupportRequired) => {
  try {
    const case_data = await getCaseDataFromStore(claimId);
    if (case_data?.directionQuestionnaire) {
      case_data.directionQuestionnaire = {...case_data.directionQuestionnaire, supportRequired};
    } else {
      case_data.directionQuestionnaire = {...new DirectionQuestionnaire(), supportRequired};
    }
    await saveDraftClaim(claimId, case_data);
  } catch (error) {
    logger.error(error);
    throw error;
  }
};
