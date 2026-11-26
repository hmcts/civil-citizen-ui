import {generateRedisKey, getCaseDataFromStore} from 'modules/draft-store/draftStoreService';
import {getResponseClaimById} from 'modules/draft-store/response/responseDraftStoreService';
import {ExpertDetails} from 'common/models/directionsQuestionnaire/experts/expertDetails';
import {ExpertDetailsList} from 'common/models/directionsQuestionnaire/experts/expertDetailsList';
import {AppRequest} from 'models/AppRequest';
import {getRouteParam} from 'common/utils/routeParamUtils';
import {toNumber} from 'lodash';

const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('supportRequiredService');

export const getExpertDetails = async (req: AppRequest): Promise<ExpertDetailsList> => {
  try {
    const caseId = getRouteParam(req, 'id');
    const redisKey = generateRedisKey(req);

    let case_data = await getCaseDataFromStore(redisKey);
    if (case_data.isClaimantIntentionPending()) {
      return case_data.claimantResponse?.directionQuestionnaire?.experts?.expertDetailsList
        ? case_data.claimantResponse.directionQuestionnaire.experts.expertDetailsList
        : new ExpertDetailsList([new ExpertDetails()]);
    }

    case_data = await getResponseClaimById(req, caseId);
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

