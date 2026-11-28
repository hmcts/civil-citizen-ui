import config from 'config';
import {isDraftClaimantResponseDatabaseEnabled} from 'app/auth/launchdarkly/launchDarklyClient';
import {CivilServiceClient} from 'client/civilServiceClient';
import {AppRequest} from 'common/models/AppRequest';
import {DraftClaimManagerResult, DraftClaimResponse} from 'common/models/draft/draftClaim';
import {getRouteParam} from 'common/utils/routeParamUtils';
import {Claim} from 'models/claim';
import {CCDClaim, CivilClaimResponse} from 'models/civilClaimResponse';
import {TTLCategory} from '../ttlConfig';
import {getDraftClaimFromStore, readRedisCaseData, saveDraftClaim} from '../draftStoreService';
import {
  createOrLoadDraftResponseInDraftStoreDb,
  deleteDraftResponseFromDb,
  getDraftResponseForCaseFromDb,
  updateDraftResponseInDb,
} from './claimantResponseDraftStoreDbService';
import {deleteCachedDraft, getCachedDraft, setCachedDraft} from './claimantResponseDraftRedisCache';

const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('claimantResponseDraftStoreService');

const civilServiceApiBaseUrl = config.get<string>('services.civilService.url');
const civilServiceClient: CivilServiceClient = new CivilServiceClient(civilServiceApiBaseUrl);

const claimFromPayload = (payload: Record<string, unknown> | undefined): Claim =>
  Object.assign(new Claim(), payload ?? {});

export const claimFromDraftResult = (raw: DraftClaimResponse): Claim => claimFromPayload(raw.payload);

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

const isClaimantResponseState = (claim: Claim): boolean =>
  claim.isClaimantIntentionPending() || claim.isAllFinalOrdersIssued();

const hasClaimantResponseProgress = (claim: Claim): boolean => {
  const response = claim?.claimantResponse as unknown as Record<string, unknown> | undefined;
  if (!response) {
    return false;
  }
  return Object.keys(response).some((key) => response[key] !== undefined && response[key] !== null);
};

const withCaseId = (claim: Claim, caseId: string): Claim => {
  const claimWithCaseId = Object.assign(new Claim(), claim);
  claimWithCaseId.id = caseId;
  return claimWithCaseId;
};

const requireUserId = (req: AppRequest): string => {
  const userId = req.session?.user?.id;
  if (!userId) {
    throw new Error('[claimantResponseDraftStoreService] user id required');
  }
  return userId;
};

const rememberDraft = async (userId: string, caseId: string, raw: DraftClaimResponse): Promise<void> => {
  await setCachedDraft(userId, caseId, raw);
};

const loadClaimFromCcd = async (req: AppRequest, caseId: string): Promise<Claim> => {
  const claim = await civilServiceClient.retrieveClaimDetails(caseId, req);
  if (!claim) {
    throw new Error('[claimantResponseDraftStoreService] case not found');
  }
  return withCaseId(claim, caseId);
};

const readJourneyClaim = async (caseId: string, userId: string): Promise<Claim | undefined> => {
  const stored = await getDraftClaimFromStore(`${caseId}${userId}`, true);
  if (!stored?.case_data) {
    return undefined;
  }
  return claimFromPayload(stored.case_data as unknown as Record<string, unknown>);
};

/**
 * A populated claim is saved as-is. The first create of an empty working claim
 * uses Redis when that copy already has claimant-response progress, and CCD otherwise.
 */
const claimToSeed = async (req: AppRequest, userId: string, caseId: string, incoming: Claim): Promise<Claim> => {
  if (!incoming.isEmpty()) {
    return withCaseId(incoming, caseId);
  }
  const redisClaim = await readJourneyClaim(caseId, userId);
  if (redisClaim && hasClaimantResponseProgress(redisClaim)) {
    const seeded = withCaseId(redisClaim, caseId);
    if (incoming.claimantResponse) {
      seeded.claimantResponse = incoming.claimantResponse;
    }
    return seeded;
  }
  const seeded = await loadClaimFromCcd(req, caseId);
  if (incoming.claimantResponse) {
    seeded.claimantResponse = incoming.claimantResponse;
  }
  return seeded;
};

export const getClaimantResponseDraft = async (
  req: AppRequest,
  caseId: string,
): Promise<DraftClaimManagerResult | null> => {
  if (!/^\d+$/.test(caseId)) {
    throw new Error('[claimantResponseDraftStoreService] invalid caseId');
  }
  const userId = requireUserId(req);
  const cached = await getCachedDraft(userId, caseId);
  if (cached) {
    return buildManagerResult(cached);
  }
  const dbResult = await getDraftResponseForCaseFromDb(req, caseId);
  if (!dbResult) {
    return null;
  }
  await rememberDraft(userId, caseId, dbResult.rawResponse);
  return buildManagerResult(dbResult.rawResponse);
};

export const saveDurableClaimantResponse = async (
  req: AppRequest,
  caseId: string,
  claim: Claim,
): Promise<DraftClaimManagerResult> => {
  if (!/^\d+$/.test(caseId)) {
    throw new Error('[claimantResponseDraftStoreService] invalid caseId');
  }
  const userId = requireUserId(req);
  const existing = await getClaimantResponseDraft(req, caseId);
  const claimToSave = existing ? withCaseId(claim, caseId) : await claimToSeed(req, userId, caseId, claim);
  if (existing) {
    const updated = await updateDraftResponseInDb(req, existing.rawResponse.draftId, claimToSave);
    await rememberDraft(userId, caseId, updated.rawResponse);
    return buildManagerResult(updated.rawResponse, false);
  }
  const created = await createOrLoadDraftResponseInDraftStoreDb(req, claimToSave);
  if (!created.isNew) {
    const updated = await updateDraftResponseInDb(req, created.rawResponse.draftId, claimToSave);
    await rememberDraft(userId, caseId, updated.rawResponse);
    return buildManagerResult(updated.rawResponse, false);
  }
  await rememberDraft(userId, caseId, created.rawResponse);
  return buildManagerResult(created.rawResponse, true);
};

export const deleteClaimantResponseDraft = async (req: AppRequest, caseId: string): Promise<void> => {
  if (!(await isDraftClaimantResponseDatabaseEnabled())) {
    return;
  }
  if (!/^\d+$/.test(caseId)) {
    throw new Error('[claimantResponseDraftStoreService] invalid caseId');
  }
  const userId = requireUserId(req);
  const existing = await getDraftResponseForCaseFromDb(req, caseId);
  if (existing) {
    await deleteDraftResponseFromDb(req, existing.rawResponse.draftId);
  }
  await deleteCachedDraft(userId, caseId);
  await clearJourneyClaimantResponse(caseId, userId);
};

const clearJourneyClaimantResponse = async (caseId: string, userId: string): Promise<void> => {
  const redisKey = `${caseId}${userId}`;
  try {
    const stored = await getDraftClaimFromStore(redisKey, true);
    if (!stored?.case_data?.claimantResponse) {
      return;
    }
    const claim = claimFromPayload(stored.case_data as unknown as Record<string, unknown>);
    delete claim.claimantResponse;
    await saveDraftClaim(redisKey, claim, true, userId, TTLCategory.JOURNEY_CACHE);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    logger.warn(`[claimantResponseDraftStoreService] failed to clear journey claimant response for case ${caseId}: ${message}`);
  }
};

/**
 * Returns the durable claim when this request is a claimant-response journey.
 * Returns null when the caller should keep using Redis.
 */
export const readDurableClaimantResponse = async (
  req: AppRequest,
  redisKey: string,
): Promise<Claim | null> => {
  const caseId = getRouteParam(req, 'id');
  if (!/^\d+$/.test(caseId)) {
    return null;
  }
  const redisClaim = await readRedisCaseData(redisKey, true);
  const claimantJourney = !redisClaim.isEmpty() && isClaimantResponseState(redisClaim);
  if (!redisClaim.isEmpty() && !claimantJourney) {
    return null;
  }

  const draft = await getClaimantResponseDraft(req, caseId);
  if (draft) {
    return claimFromDraftResult(draft.rawResponse);
  }
  if (!claimantJourney) {
    return null;
  }

  const claimWithoutDraftResponse = Object.assign(new Claim(), redisClaim);
  delete claimWithoutDraftResponse.claimantResponse;
  return claimWithoutDraftResponse;
};

export const saveClaimantResponseDraftIfApplicable = async (
  req: AppRequest,
  claim: Claim,
  ttlCategory: TTLCategory,
): Promise<boolean> => {
  if (ttlCategory === TTLCategory.JOURNEY_CACHE) {
    return false;
  }
  if (!isClaimantResponseState(claim)) {
    return false;
  }
  const caseId = getRouteParam(req, 'id');
  if (!/^\d+$/.test(caseId)) {
    return false;
  }
  if (!hasClaimantResponseProgress(claim)) {
    const existing = await getClaimantResponseDraft(req, caseId);
    if (!existing) {
      return false;
    }
  }
  await saveDurableClaimantResponse(req, caseId, claim);
  return true;
};
