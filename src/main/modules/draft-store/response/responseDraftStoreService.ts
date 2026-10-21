import {isDraftClaimDatabaseEnabled} from 'app/auth/launchdarkly/launchDarklyClient';
import {AppRequest} from 'common/models/AppRequest';
import {DraftClaimManagerResult, DraftClaimResponse} from 'common/models/draft/draftClaim';
import {Claim} from 'models/claim';
import {CCDClaim, CivilClaimResponse} from 'models/civilClaimResponse';
import {
  createOrLoadDraftClaimInDraftStoreDb,
  deleteDraftClaimFromStore,
  getDraftForCaseFromDraftStoreDb,
  updateDraftClaimInStore,
} from '../draftStoreDbService';
import * as draftStoreService from '../draftStoreService';

const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('responseDraftStoreService');

export const getResponseDraft = async (req: AppRequest, caseId: string): Promise<DraftClaimManagerResult | null> => {
  if (!/^\d+$/.test(caseId)) {
    throw new Error('[responseDraftStoreService] invalid caseId');
  }

  const userId = req.session?.user?.id;
  if (!userId) {
    throw new Error('[responseDraftStoreService] user id required to fetch response draft');
  }

  const redisDraft = await getRedisResponseDraft(caseId, userId);

  if (!(await isDraftClaimDatabaseEnabled())) {
    return redisDraft ? buildManagerResultFromRedis(redisDraft) : null;
  }

  if (redisDraft) {
    return buildManagerResultFromRedis(redisDraft);
  }

  const dbResult = await getDraftForCaseFromDraftStoreDb(req, caseId);
  return dbResult ? buildManagerResult(dbResult.rawResponse) : null;
};

export const createOrLoadResponse = async (req: AppRequest, caseId: string, claim?: Claim): Promise<DraftClaimManagerResult> => {
  if (!/^\d+$/.test(caseId)) {
    throw new Error('[responseDraftStoreService] invalid caseId');
  }

  const userId = req.session?.user?.id;
  if (!userId) {
    throw new Error('[responseDraftStoreService] user id required to create/load draft');
  }

  const claimToSave = claim ? withCaseId(claim, caseId) : undefined;

  if (await isDraftClaimDatabaseEnabled()) {
    const redisDraft = await getRedisResponseDraft(caseId, userId);
    if (redisDraft) {
      return continueOnRedis(caseId, userId, claimToSave, false);
    }

    const existing = await getDraftForCaseFromDraftStoreDb(req, caseId);
    if (existing) {
      if (claimToSave) {
        const updated = await updateDraftClaimInStore(req, existing.rawResponse.draftId, claimToSave);
        return buildManagerResult(updated.rawResponse, false);
      }
      return buildManagerResult(existing.rawResponse, false);
    }

    const dbResult = await createOrLoadDraftClaimInDraftStoreDb(req, claimToSave ?? withCaseId(undefined, caseId));
    return buildManagerResult(dbResult.rawResponse, dbResult.isNew);
  }

  const stored = await getRedisResponseDraft(caseId, userId);
  const isNew = !stored;
  if (isNew) {
    await draftStoreService.createDraftClaimInStoreWithExpiryTime(responseRedisKey(caseId, userId));
  }
  return continueOnRedis(caseId, userId, claimToSave, isNew);
};

export const updateResponseDraft = async (req: AppRequest, caseId: string, claim: Claim, draftId?: string): Promise<DraftClaimManagerResult> => {
  if (!/^\d+$/.test(caseId)) {
    throw new Error('[responseDraftStoreService] invalid caseId');
  }

  const userId = req.session?.user?.id;
  if (!userId) {
    throw new Error('[responseDraftStoreService] user id required to update draft');
  }

  const claimToSave = withCaseId(claim, caseId);

  if (await isDraftClaimDatabaseEnabled()) {
    const redisDraft = await getRedisResponseDraft(caseId, userId);
    if (redisDraft) {
      return continueOnRedis(caseId, userId, claimToSave, false);
    }

    if (!draftId) {
      throw new Error('[responseDraftStoreService] draft id required to update draft');
    }
    const dbResult = await updateDraftClaimInStore(req, draftId, claimToSave);
    return buildManagerResult(dbResult.rawResponse);
  }

  return continueOnRedis(caseId, userId, claimToSave, false);
};

export const deleteResponseDraft = async (req: AppRequest, caseId: string, draftId?: string): Promise<void> => {
  if (!/^\d+$/.test(caseId)) {
    throw new Error('[responseDraftStoreService] invalid caseId');
  }

  const userId = req.session?.user?.id;
  if (!userId) {
    throw new Error('[responseDraftStoreService] user id required to delete draft');
  }

  if (await isDraftClaimDatabaseEnabled()) {
    const redisDraft = await getRedisResponseDraft(caseId, userId);
    if (redisDraft) {
      await draftStoreService.deleteDraftClaimFromStore(responseRedisKey(caseId, userId));
      return;
    }

    if (draftId) {
      await deleteDraftClaimFromStore(req, draftId);
    }
    await draftStoreService.deleteDraftClaimFromStore(responseRedisKey(caseId, userId));
    return;
  }

  await draftStoreService.deleteDraftClaimFromStore(responseRedisKey(caseId, userId));
};

const responseRedisKey = (caseId: string, userId: string): string => `${caseId}${userId}`;

const withCaseId = (claim: Claim | undefined, caseId: string): Claim => {
  const claimWithCaseId = claim ? Object.assign(new Claim(), claim) : new Claim();
  claimWithCaseId.id = caseId;
  return claimWithCaseId;
};

const continueOnRedis = async (caseId: string, userId: string, claim?: Claim, isNew = false): Promise<DraftClaimManagerResult> => {
  const redisKey = responseRedisKey(caseId, userId);
  if (claim) {
    await draftStoreService.saveDraftClaim(redisKey, claim, true, userId);
  }
  const latest = await draftStoreService.getDraftClaimFromStore(redisKey, true);
  return buildManagerResultFromRedis(latest, isNew);
};

const buildManagerResult = (raw: DraftClaimResponse, isNew?: boolean): DraftClaimManagerResult => {
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

const buildManagerResultFromRedis = (stored: CivilClaimResponse, isNew?: boolean): DraftClaimManagerResult => {
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

const getRedisResponseDraft = async (caseId: string, userId: string): Promise<CivilClaimResponse | null> => {
  try {
    const stored = await draftStoreService.getDraftClaimFromStore(responseRedisKey(caseId, userId), true);
    return stored?.case_data ? stored : null;
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    logger.warn(`[responseDraftStoreService] redis read error for case ${caseId}: ${message}`);
    return null;
  }
};
