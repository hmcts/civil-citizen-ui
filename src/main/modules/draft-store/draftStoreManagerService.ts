import {isDraftClaimDatabaseEnabled} from 'app/auth/launchdarkly/launchDarklyClient';
import {AppRequest} from 'common/models/AppRequest';
import {DraftClaimResponse, DraftClaimManagerResult} from 'common/models/draft/draftClaim';
import {Claim} from 'models/claim';
import {CCDClaim, CivilClaimResponse} from 'models/civilClaimResponse';
import {
  createOrLoadDraftClaimInDraftStoreDb,
  getActiveDraftFromDraftStoreDb,
  updateDraftClaimInStore,
  deleteDraftClaimFromStore,
} from './draftStoreDbService';
import {
  getDraftClaimFromStore,
  saveDraftClaim,
  createDraftClaimInStoreWithExpiryTime,
  deleteDraftClaimFromStore as deleteDraftClaimFromRedis,
} from './draftStoreService';
import {getCachedDraft, setCachedDraft, deleteCachedDraft} from './draftClaimRedisCache';

const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('draftStoreManagerService');

const buildManagerResult = (
  raw: DraftClaimResponse,
  isNew?: boolean,
): DraftClaimManagerResult => {
  const claimResponse = new CivilClaimResponse();
  claimResponse.id = raw.draftId;
  claimResponse.case_data = raw.payload as unknown as CCDClaim;

  return {
    claimResponse,
    rawResponse: raw,
    isNew,
    createdAt: raw.createdAt,
    updatedAt: raw.updatedAt,
    expiresAt: raw.expiresAt,
  };
};

const buildManagerResultFromRedis = (
  stored: CivilClaimResponse,
  isNew?: boolean,
): DraftClaimManagerResult => {
  const caseData = stored.case_data as unknown as Claim | undefined;
  const createdAt = caseData?.draftClaimCreatedAt
    ? new Date(caseData.draftClaimCreatedAt).toISOString()
    : '';
  return buildManagerResult({
    draftId: stored.id,
    payload: (stored.case_data ?? {}) as unknown as Record<string, unknown>,
    createdAt,
    updatedAt: '',
    expiresAt: '',
  }, isNew);
};

export const getDraftClaim = async (req: AppRequest): Promise<DraftClaimManagerResult | null> => {
  const userId = req.session?.user?.id;
  if (!userId) {
    throw new Error('[draftStoreManagerService] user Id required to fetch draft');
  }

  if (await isDraftClaimDatabaseEnabled()) {
    const cached = await getCachedDraft(userId);

    if (cached) {
      logger.info(`[draftStoreManagerService] returning cached draft for user: ${userId}`);
      return buildManagerResult(cached);
    }
    logger.info(`[draftStoreManagerService] cache miss for user: ${userId} fetching from db instead`);
    const dbResult = await getActiveDraftFromDraftStoreDb(req);
    if (!dbResult) {
      return null;
    }
    await setCachedDraft(userId, dbResult.rawResponse);
    return buildManagerResult(dbResult.rawResponse);
  }

  logger.info(`[draftStoreManagerService] draft claim database flag off, fetching from redis for user: ${userId}`);
  const stored = await getDraftClaimFromStore(userId, true);
  if (!stored?.case_data) {
    return null;
  }
  return buildManagerResultFromRedis(stored);
};

export const createOrLoadDraft = async (req: AppRequest, claim?: Claim): Promise<DraftClaimManagerResult> => {
  const userId = req.session?.user?.id;
  if (!userId) {
    throw new Error('[draftStoreManagerService] user id required to create/load draft');
  }

  if (await isDraftClaimDatabaseEnabled()) {
    const dbResult = await createOrLoadDraftClaimInDraftStoreDb(req, claim);
    await setCachedDraft(userId, dbResult.rawResponse);
    return buildManagerResult(dbResult.rawResponse, dbResult.isNew);
  }

  logger.info(`[draftStoreManagerService] draft claim database flag off, creating/loading redis draft for user: ${userId}`);
  const stored = await getDraftClaimFromStore(userId, true);
  const isNew = !stored?.case_data;
  if (isNew) {
    await createDraftClaimInStoreWithExpiryTime(userId);
  }
  if (claim) {
    await saveDraftClaim(userId, claim, true, userId);
  }
  const latest = await getDraftClaimFromStore(userId, true);
  return buildManagerResultFromRedis(latest, isNew);
};

export const updateDraftClaim = async (req: AppRequest, claim: Claim, draftId: string): Promise<DraftClaimManagerResult> => {
  const userId = req.session?.user?.id;
  if (!userId) {
    throw new Error('[draftStoreManagerService] user id required to update draft');
  }
  if (!draftId) {
    throw new Error('[draftStoreManagerService] draft id required to update draft');
  }

  if (await isDraftClaimDatabaseEnabled()) {
    const dbResult = await updateDraftClaimInStore(req, draftId, claim);
    await setCachedDraft(userId, dbResult.rawResponse);
    return buildManagerResult(dbResult.rawResponse);
  }

  logger.info(`[draftStoreManagerService] draft claim database flag off, saving redis draft for user: ${userId}`);
  await saveDraftClaim(userId, claim, true, userId);
  const latest = await getDraftClaimFromStore(userId, true);
  return buildManagerResultFromRedis(latest);
};

export const deleteDraftClaim = async (req: AppRequest, draftId: string): Promise<void> => {
  const userId = req.session?.user?.id;
  if (!userId) {
    throw new Error('[draftStoreManagerService] user id required to delete draft');
  }

  if (await isDraftClaimDatabaseEnabled()) {
    await deleteDraftClaimFromStore(req, draftId);
    await deleteCachedDraft(userId);
    return;
  }

  logger.info(`[draftStoreManagerService] draft claim database flag off, deleting redis draft for user: ${userId}`);
  await deleteDraftClaimFromRedis(userId);
};
