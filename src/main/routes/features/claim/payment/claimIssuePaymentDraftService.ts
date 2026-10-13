import {AppRequest} from 'common/models/AppRequest';
import {Claim} from 'models/claim';
import {applyPaymentRetention, getDraftClaimForCase, updateDraftClaim} from 'modules/draft-store/draftStoreManagerService';
import {
  deleteDraftClaimFromStore as deleteDraftClaimFromRedis,
  generateRedisKey,
  getDraftClaimFromStore,
  saveDraftClaim,
} from 'modules/draft-store/draftStoreService';
import {getClaimById} from 'modules/utilityService';
import {getRouteParam, isUsablePathSegment} from 'common/utils/routeParamUtils';

const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('claimIssuePaymentDraftService');

export interface ClaimIssuePaymentDraft {
  claim: Claim;
  draftId?: string;
}

export const clearRedisWorkingDraftForPayment = async (
  req: AppRequest,
  claim: Claim,
): Promise<boolean> => {
  const userId = req.session?.user?.id;
  const caseId = claim?.id;
  if (!userId || !caseId || typeof caseId !== 'string') {
    return false;
  }

  const workingDraft = await getDraftClaimFromStore(userId, true);
  if (!workingDraft?.case_data) {
    return false;
  }

  const paymentKey = `${caseId}${userId}`;
  await saveDraftClaim(paymentKey, claim, true, userId);
  await deleteDraftClaimFromRedis(userId);
  logger.info(`Moved Redis working draft to payment key for claim id ${caseId}`);
  return true;
};

export const getClaimIssuePaymentClaim = async (req: AppRequest): Promise<ClaimIssuePaymentDraft> => {
  const claimId = getRouteParam(req, 'id');
  if (!isUsablePathSegment(claimId)) {
    throw new Error('[claimIssuePaymentDraftService] claim id is required');
  }

  const draftResult = await getDraftClaimForCase(req, claimId);
  if (draftResult?.claimResponse?.case_data) {
    const claim = Object.assign(new Claim(), draftResult.claimResponse.case_data as unknown as Claim);
    if (!claim.isEmpty()) {
      if (draftResult.createdAt && !claim.draftClaimCreatedAt) {
        claim.draftClaimCreatedAt = new Date(draftResult.createdAt);
      }
      const draftId = draftResult.rawResponse.draftId;
      logger.info(`Payment draft ${draftId} loaded from db for claim id ${claimId}`);
      return {claim, draftId};
    }
    logger.info(
      `DB draft for claim id ${claimId} is empty; falling back to Redis payment data`,
    );
  }

  const claim = await getClaimById(claimId, req, true);
  logger.info(`Payment claim loaded from Redis for claim id ${claimId}`);
  return {claim};
};

export const saveClaimIssuePaymentClaim = async (req: AppRequest, claim: Claim, draftId?: string): Promise<void> => {
  if (draftId) {
    await updateDraftClaim(req, claim, draftId);
    await applyPaymentRetention(req, draftId);
    return;
  }
  await saveDraftClaim(generateRedisKey(req), claim, true, req.session.user?.id);
};
