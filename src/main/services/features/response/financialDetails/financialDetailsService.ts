import {getResponseClaimById, getResponseDraft, updateResponseDraft} from 'modules/draft-store/response/responseDraftStoreService';
import {AppRequest} from 'models/AppRequest';
import {Claim} from 'models/claim';
import {getRouteParam} from 'common/utils/routeParamUtils';

const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('financialDetailsService');

export const getFinancialDetailsClaim = async (req: AppRequest): Promise<Claim> => {
  try {
    const caseId = getRouteParam(req, 'id');
    return await getResponseClaimById(req, caseId);
  } catch (error) {
    logger.error(error);
    throw error;
  }
};

export const saveSharedFinancialDetails = async (req: AppRequest): Promise<void> => {
  try {
    const caseId = getRouteParam(req, 'id');
    const draftResult = await getResponseDraft(req, caseId);
    if (!draftResult) {
      throw new Error('[financialDetailsService] no response draft found');
    }
    const claim = Object.assign(new Claim(), draftResult.claimResponse?.case_data as unknown as Claim);
    const draftId = draftResult.rawResponse?.draftId;

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
