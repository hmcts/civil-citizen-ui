import {getResponseClaimById, getResponseDraft, updateResponseDraft} from 'modules/draft-store/response/responseDraftStoreService';
import {RejectAllOfClaim} from '../../../common/form/models/rejectAllOfClaim';
import {AppRequest} from 'models/AppRequest';
import {getRouteParam} from 'common/utils/routeParamUtils';
import {Claim} from 'models/claim';

const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('rejectAllOfClaimService');

export const getRejectAllOfClaim = async (req: AppRequest): Promise<RejectAllOfClaim> => {
  try {
    const caseId = getRouteParam(req, 'id');
    const claim = await getResponseClaimById(req, caseId);
    if (claim.rejectAllOfClaim) {
      return new RejectAllOfClaim(claim.rejectAllOfClaim.option);
    }
    return new RejectAllOfClaim();
  } catch (error) {
    logger.error(error);
    throw error;
  }
};

export const saveRejectAllOfClaim = async (req: AppRequest, form: RejectAllOfClaim) => {
  try {
    const caseId = getRouteParam(req, 'id');
    const draftResult = await getResponseDraft(req, caseId);
    if (!draftResult) {
      throw new Error('[rejectAllOfClaimService] no draft response found');
    }

    const claim = Object.assign(new Claim(), draftResult.claimResponse?.case_data as unknown as Claim);
    const draftId = draftResult.rawResponse?.draftId;

    claim.rejectAllOfClaim = form;

    if (draftResult.createdAt && !claim.draftClaimCreatedAt) {
      claim.draftClaimCreatedAt = new Date(draftResult.createdAt);
    }
    await updateResponseDraft(req, caseId, claim, draftId);
  } catch (error) {
    logger.error(error);
    throw error;
  }
};
