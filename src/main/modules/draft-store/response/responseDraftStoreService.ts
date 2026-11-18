import config from 'config';
import {isDraftDefendantResponseDatabaseEnabled} from 'app/auth/launchdarkly/launchDarklyClient';
import {CivilServiceClient} from 'client/civilServiceClient';
import {AppRequest} from 'common/models/AppRequest';
import {DraftClaimManagerResult, DraftClaimResponse} from 'common/models/draft/draftClaim';
import {Claim} from 'models/claim';
import {CCDClaim, CivilClaimResponse} from 'models/civilClaimResponse';
import {
  createOrLoadDraftResponseInDraftStoreDb,
  deleteDraftResponseFromDb,
  getDraftResponseForCaseFromDb,
  updateDraftResponseInDb,
} from './responseDraftStoreDbService';
import * as draftStoreService from '../draftStoreService';

const civilServiceApiBaseUrl = config.get<string>('services.civilService.url');
const civilServiceClient: CivilServiceClient = new CivilServiceClient(civilServiceApiBaseUrl);

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

  if (!(await isDraftDefendantResponseDatabaseEnabled())) {
    const redisDraft = await getRedisResponseDraft(caseId, userId);
    return redisDraft ? buildManagerResultFromRedis(redisDraft) : null;
  }

  const dbResult = await getDraftResponseForCaseFromDb(req, caseId);
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

  if (await isDraftDefendantResponseDatabaseEnabled()) {
    const existing = await getDraftResponseForCaseFromDb(req, caseId);
    if (existing) {
      if (claimToSave) {
        const updated = await updateDraftResponseInDb(req, existing.rawResponse.draftId, claimToSave);
        return buildManagerResult(updated.rawResponse, false);
      }
      return buildManagerResult(existing.rawResponse, false);
    }

    const seededClaim = claimToSave ?? await claimToSeed(req, caseId, userId);
    const dbResult = await createOrLoadDraftResponseInDraftStoreDb(req, seededClaim);
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

  if (await isDraftDefendantResponseDatabaseEnabled()) {
    if (!draftId) {
      throw new Error('[responseDraftStoreService] draft id required to update draft');
    }
    const dbResult = await updateDraftResponseInDb(req, draftId, claimToSave);
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

  if (await isDraftDefendantResponseDatabaseEnabled()) {
    if (draftId) {
      await deleteDraftResponseFromDb(req, draftId);
    }
    await draftStoreService.deleteDraftClaimFromStore(responseRedisKey(caseId, userId));
    return;
  }

  await draftStoreService.deleteDraftClaimFromStore(responseRedisKey(caseId, userId));
};

export const getResponseClaimById = async (req: AppRequest, caseId: string): Promise<Claim> => {
  if (await isDraftDefendantResponseDatabaseEnabled()) {
    const draftResult = await createOrLoadResponse(req, caseId);
    if (draftResult?.claimResponse?.case_data) {
      return Object.assign(new Claim(), draftResult.claimResponse.case_data as unknown as Claim);
    }
    return new Claim();
  }

  const draftResult = await getResponseDraft(req, caseId);
  if (draftResult?.claimResponse?.case_data) {
    return Object.assign(new Claim(), draftResult.claimResponse.case_data as unknown as Claim);
  }
  return new Claim();
};

const responseRedisKey = (caseId: string, userId: string): string => `${caseId}${userId}`;

const claimToSeed = async (req: AppRequest, caseId: string, userId: string): Promise<Claim> => {
  const redisDraft = await getRedisResponseDraft(caseId, userId);
  const redisClaim = redisDraft ? Object.assign(new Claim(), redisDraft.case_data as unknown as Claim) : undefined;
  if (redisClaim && hasResponseProgress(redisClaim)) {
    return withCaseId(redisClaim, caseId);
  }
  return loadClaimFromCcd(req, caseId);
};

const hasResponseProgress = (claim: Claim): boolean =>
  Boolean(claim.claimBilingualLanguagePreference || claim.respondent1?.responseType);

const loadClaimFromCcd = async (req: AppRequest, caseId: string): Promise<Claim> => {
  const claim = await civilServiceClient.retrieveClaimDetails(caseId, req);
  if (!claim) {
    throw new Error('[responseDraftStoreService] case not found');
  }
  return withCaseId(claim, caseId);
};

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
