import {Explanation} from 'common/form/models/statementOfMeans/explanation';
import {getResponseDraft, getResponseClaimById, updateResponseDraft} from 'modules/draft-store/response/responseDraftStoreService';
import {StatementOfMeans} from 'common/models/statementOfMeans';
import {AppRequest} from 'models/AppRequest';
import {Claim} from 'models/claim';
import {getRouteParam} from 'common/utils/routeParamUtils';

const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('explanationService');

export const getExplanation = async (req: AppRequest): Promise<Explanation> => {
  try {
    const caseId = getRouteParam(req, 'id');
    const claim = await getResponseClaimById(req, caseId);

    if (claim.statementOfMeans?.explanation) {
      return claim.statementOfMeans.explanation;
    }
    return new Explanation();
  } catch (error) {
    logger.error(error);
    throw error;
  }
};

export const saveExplanation = async (req: AppRequest, explanation: Explanation) => {
  try {
    const caseId = getRouteParam(req, 'id');
    const draftResult = await getResponseDraft(req, caseId);
    if (!draftResult) {
      throw new Error('[explanationService] no response draft found');
    }
    const claim = Object.assign(new Claim(), draftResult.claimResponse?.case_data as unknown as Claim);
    const draftId = draftResult.rawResponse?.draftId;

    if (claim.statementOfMeans) {
      claim.statementOfMeans.explanation = explanation;
    } else {
      const statementOfMeans = new StatementOfMeans();
      statementOfMeans.explanation = explanation;
      claim.statementOfMeans = statementOfMeans;
    }
    claim.taskSharedFinancialDetails = true;
    if (draftResult.createdAt && !claim.draftClaimCreatedAt) {
      claim.draftClaimCreatedAt = new Date(draftResult.createdAt);
    }
    await updateResponseDraft(req, caseId, claim, draftId);
  } catch (error) {
    logger.error(error);
    throw error;
  }
};
