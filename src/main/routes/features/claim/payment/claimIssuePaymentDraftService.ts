import {AppRequest} from 'common/models/AppRequest';
import {Claim} from 'models/claim';
import {getDraftClaimForCase, updateDraftClaim, createOrLoadDraft} from 'modules/draft-store/draftStoreManagerService';
import {generateRedisKey, saveDraftClaim} from 'modules/draft-store/draftStoreService';
import {getClaimById} from 'modules/utilityService';
import {getRouteParam, isUsablePathSegment} from 'common/utils/routeParamUtils';
import {isDraftClaimDatabaseEnabled} from 'app/auth/launchdarkly/launchDarklyClient';
import { getTTLDaysForCategory, TTLCategory } from 'modules/draft-store/ttlConfig';

const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('claimIssuePaymentDraftService');

export interface ClaimIssuePaymentDraft {
  claim: Claim;
  draftId?: string;
}

export const getClaimIssuePaymentClaim = async (req: AppRequest): Promise<ClaimIssuePaymentDraft> => {
  const claimId = getRouteParam(req, 'id');
  if (!isUsablePathSegment(claimId)) {
    throw new Error('[claimIssuePaymentDraftService] claim id is required');
  }

  const draftResult = await getDraftClaimForCase(req, claimId);
  if (draftResult?.claimResponse?.case_data) {
    const claim = Object.assign(new Claim(), draftResult.claimResponse.case_data as unknown as Claim);
    if (draftResult.createdAt && !claim.draftClaimCreatedAt) {
      claim.draftClaimCreatedAt = new Date(draftResult.createdAt);
    }
    const draftId = draftResult.rawResponse.draftId;
    logger.info(`Payment draft ${draftId} loaded from db for claim id ${claimId}`);
    return {claim, draftId};
  }

  const claim = await getClaimById(claimId, req, true);
  logger.info(`Payment claim loaded from Redis for claim id ${claimId}`);
  if (await isDraftClaimDatabaseEnabled() && claim) {
    claim.draftClaimCacheTtlDays = getTTLDaysForCategory(TTLCategory.PAYMENT_SESSION);
    const dbDraft = await createOrLoadDraft(req, claim);
    const draftId = dbDraft.rawResponse.draftId;
    return {claim, draftId};
  }
  return {claim};
};

export const saveClaimIssuePaymentClaim = async (req: AppRequest, claim: Claim, draftId?: string): Promise<void> => {
  if (draftId) {
    await updateDraftClaim(req, claim, draftId);
    return;
  }
  await saveDraftClaim(generateRedisKey(req), claim, true, req.session.user?.id);
};
