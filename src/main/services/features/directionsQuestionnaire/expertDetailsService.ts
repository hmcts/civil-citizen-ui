import {getCaseDataFromStore, saveDraftClaim} from '../../../modules/draft-store/draftStoreService';
import {ExpertDetails} from '../../../common/models/directionsQuestionnaire/experts/expertDetails';
import {DirectionQuestionnaire} from '../../../common/models/directionsQuestionnaire/directionQuestionnaire';
import {Experts} from '../../../common/models/directionsQuestionnaire/experts/experts';
import {ExpertDetailsList} from '../../../common/models/directionsQuestionnaire/experts/expertDetailsList';

const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('supportRequiredService');

export const getExpertDetails = async (claimId: string): Promise<ExpertDetailsList> => {
  try {
    const case_data = await getCaseDataFromStore(claimId);
    const expertDetails = case_data.directionQuestionnaire?.experts?.expertDetailsList
      ? case_data.directionQuestionnaire.experts.expertDetailsList
      : new ExpertDetailsList([new ExpertDetails()]);
    return expertDetails;
  } catch (error) {
    logger.error(error);
    throw error;
  }
};

export const saveExpertDetails = async (claimId: string, value: any, directionQuestionnairePropertyName: string): Promise<void> => {
  try {
    const claim: any = await getCaseDataFromStore(claimId);
    if (claim.directionQuestionnaire?.experts) {
      claim.directionQuestionnaire.experts[directionQuestionnairePropertyName] = value;
    } else {
      const directionQuestionnaire: any = new DirectionQuestionnaire();
      directionQuestionnaire.experts = new Experts();
      directionQuestionnaire.experts[directionQuestionnairePropertyName] = value;
      claim.directionQuestionnaire = directionQuestionnaire;
    }
    await saveDraftClaim(claimId, claim);
  } catch (error) {
    logger.error(error);
    throw error;
  }
};
