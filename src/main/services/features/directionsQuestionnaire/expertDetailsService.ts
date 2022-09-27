import {getCaseDataFromStore, saveDraftClaim} from '../../../modules/draft-store/draftStoreService';
import {ExpertDetails} from '../../../common/models/directionsQuestionnaire/experts/expertDetails';
import {DirectionQuestionnaire} from '../../../common/models/directionsQuestionnaire/directionQuestionnaire';
import {Experts} from '../../../common/models/directionsQuestionnaire/experts/experts';
import {ExpertDetailsList} from '../../../common/models/directionsQuestionnaire/experts/expertDetailsList';
import {toNumber} from 'lodash';

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

export const getExpertDetailsForm = (items: ExpertDetails[]): ExpertDetailsList => {
  const expertDetailsList: ExpertDetailsList = new ExpertDetailsList(items.map((expertDetail: ExpertDetails) => new ExpertDetails(
    expertDetail.firstName,
    expertDetail.lastName,
    expertDetail.emailAddress,
    expertDetail.phoneNumber,
    expertDetail.whyNeedExpert,
    expertDetail.fieldOfExpertise,
    toNumber(expertDetail.estimatedCost),
  )));

  return expertDetailsList;
};

export const saveExpertDetails = async (claimId: string, value: any, expertsPropertyName: string): Promise<void> => {
  try {
    const claim: any = await getCaseDataFromStore(claimId);
    if (claim.directionQuestionnaire?.experts) {
      claim.directionQuestionnaire.experts[expertsPropertyName] = value;
    } else {
      const directionQuestionnaire: any = new DirectionQuestionnaire();
      directionQuestionnaire.experts = new Experts();
      directionQuestionnaire.experts[expertsPropertyName] = value;
      claim.directionQuestionnaire = directionQuestionnaire;
    }
    await saveDraftClaim(claimId, claim);
  } catch (error) {
    logger.error(error);
    throw error;
  }
};
