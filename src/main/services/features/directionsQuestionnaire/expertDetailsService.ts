import { getCaseDataFromStore, saveDraftClaim } from '../../../modules/draft-store/draftStoreService';
import { ExpertDetails } from '../../../common/models/directionsQuestionnaire/experts/expertDetails';
import { DirectionQuestionnaire } from '../../../common/models/directionsQuestionnaire/directionQuestionnaire';
import { Experts } from '../../../common/models/directionsQuestionnaire/experts/experts';
import { ExpertDetailsList } from '../../../common/models/directionsQuestionnaire/experts/expertDetailsList';

const { Logger } = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('supportRequiredService');

export const getExpertDetails = async (claimId: string): Promise<ExpertDetailsList> => {
  try {
    const case_data = await getCaseDataFromStore(claimId);
    const expertDetails = case_data.directionQuestionnaire?.experts?.expertDetailsList
      ? case_data.directionQuestionnaire.experts.expertDetailsList
      : { items: [new ExpertDetails()] };
    return expertDetails;
  } catch (error) {
    logger.error(error);
    throw error;
  }
};

export const saveExpertDetails = async (claimId: string, expertDetails: ExpertDetails[]) => {
  try {
    const case_data = await getCaseDataFromStore(claimId);
    if (!case_data.directionQuestionnaire?.experts.expertDetailsList.items) {
      case_data.directionQuestionnaire = new DirectionQuestionnaire();
      case_data.directionQuestionnaire.experts = new Experts();
      case_data.directionQuestionnaire.experts.expertDetailsList.items = [];
    }
    case_data.directionQuestionnaire.experts.expertDetailsList.items = expertDetails;
    await saveDraftClaim(claimId, case_data);
  } catch (error) {
    logger.error(error);
    throw error;
  }
};
