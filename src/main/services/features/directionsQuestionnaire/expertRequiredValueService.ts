import {DirectionQuestionnaire} from 'common/models/directionsQuestionnaire/directionQuestionnaire';
import {generateRedisKey, getCaseDataFromStore, saveDraftClaim} from '../../../modules/draft-store/draftStoreService';
import {getResponseDraft, updateResponseDraft} from 'modules/draft-store/response/responseDraftStoreService';
import {Experts} from 'common/models/directionsQuestionnaire/experts/experts';
import {Claim} from 'models/claim';
import {AppRequest} from 'models/AppRequest';
import {getRouteParam} from 'common/utils/routeParamUtils';

const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('expertReportDetailsService');

export const saveExpertRequiredValue = async (req: AppRequest, expertRequiredValue: boolean) => {
  try {
    const caseId = getRouteParam(req, 'id');
    const redisKey = generateRedisKey(req);

    let claim: Claim = await getCaseDataFromStore(redisKey);
    let draftId: string | undefined;

    if (!claim.isClaimantIntentionPending()) {
      const draftResult = await getResponseDraft(req, caseId);
      if (!draftResult) {
        throw new Error('[expertRequiredValueService] no response draft found');
      }
      claim = Object.assign(new Claim(), draftResult.claimResponse?.case_data as unknown as Claim);
      draftId = draftResult.rawResponse?.draftId;
      if (draftResult.createdAt && !claim.draftClaimCreatedAt) {
        claim.draftClaimCreatedAt = new Date(draftResult.createdAt);
      }
    }

    if (claim.isClaimantIntentionPending()) {
      setExpertRequiredValueForClaimant(expertRequiredValue, claim);
    } else {
      if (!claim.directionQuestionnaire) {
        claim.directionQuestionnaire = new DirectionQuestionnaire();
      }
      if (!claim.directionQuestionnaire.experts) {
        claim.directionQuestionnaire.experts = new Experts();
      }

      claim.directionQuestionnaire.experts.expertRequired = expertRequiredValue;

      if (!expertRequiredValue) {
        claim.directionQuestionnaire.experts.expertReportDetails = null;
        claim.directionQuestionnaire.experts.permissionForExpert = null;
        claim.directionQuestionnaire.experts.expertCanStillExamine = null;
        claim.directionQuestionnaire.experts.expertDetailsList = null;
      }
    }

    if (claim.isClaimantIntentionPending()) {
      await saveDraftClaim(redisKey, claim);
    } else {
      await updateResponseDraft(req, caseId, claim, draftId);
    }
  } catch (error) {
    logger.error(error);
    throw error;
  }
};

const setExpertRequiredValueForClaimant = (expertRequired: boolean, claim: Claim): void => {
  if (!claim.claimantResponse.directionQuestionnaire) {
    claim.claimantResponse.directionQuestionnaire = new DirectionQuestionnaire();
  }
  if (!claim.claimantResponse.directionQuestionnaire?.experts) {
    claim.claimantResponse.directionQuestionnaire.experts = new Experts();
  }
  claim.claimantResponse.directionQuestionnaire.experts.expertRequired = expertRequired;
  if (!expertRequired) {
    resetExperts(claim.claimantResponse.directionQuestionnaire.experts);
  }
};

const resetExperts = (experts: Experts) => {
  experts.expertReportDetails = null;
  experts.permissionForExpert = null;
  experts.expertCanStillExamine = null;
  experts.expertDetailsList = null;
};
