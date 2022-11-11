import {getCaseDataFromStore} from '../../../modules/draft-store/draftStoreService';
import {ExpertDetails} from '../../../common/models/directionsQuestionnaire/experts/expertDetails';
import {ExpertDetailsList} from '../../../common/models/directionsQuestionnaire/experts/expertDetailsList';
import {toNumber} from 'lodash';

const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('supportRequiredService');

export const getExpertDetails = async (claimId: string): Promise<ExpertDetailsList> => {
  try {
    const case_data = await getCaseDataFromStore(claimId);
    return case_data.directionQuestionnaire?.experts?.expertDetailsList
      ? case_data.directionQuestionnaire.experts.expertDetailsList
      : new ExpertDetailsList([new ExpertDetails()]);
  } catch (error) {
    logger.error(error);
    throw error;
  }
};

export const getExpertDetailsForm = (items: ExpertDetails[]): ExpertDetailsList => {
  return new ExpertDetailsList(items.map((expertDetail: ExpertDetails) => new ExpertDetails(
    expertDetail.firstName,
    expertDetail.lastName,
    expertDetail.emailAddress,
    expertDetail.phoneNumber,
    expertDetail.whyNeedExpert,
    expertDetail.fieldOfExpertise,
    toNumber(expertDetail.estimatedCost),
  )));
};

