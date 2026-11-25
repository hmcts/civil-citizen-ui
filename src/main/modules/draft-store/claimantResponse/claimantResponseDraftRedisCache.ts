import {app} from '../../../app-instance';
import {DraftClaimResponse} from 'common/models/draft/draftClaim';

const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('claimantResponseDraftRedisCache');

const getErrorMessage = (error: unknown): string =>
  error instanceof Error ? error.message : String(error);

export const getRedisKey = (userId: string, caseId: string): string =>
  `draft-claimant-response:${userId}:${caseId}`;

export const calculateTtlInSeconds = (expiresAtISO: string): number => {
  const expiresAt = new Date(expiresAtISO).getTime();
  const now = Date.now();
  const diffInSeconds = Math.floor((expiresAt - now) / 1000);
  return diffInSeconds > 0 ? diffInSeconds : 0;
};

export const getCachedDraft = async (userId: string, caseId: string): Promise<DraftClaimResponse | null> => {
  const key = getRedisKey(userId, caseId);
  try {
    const cachedData = await app.locals.draftStoreClient.get(key);
    if (!cachedData) {
      return null;
    }
    const parsed: DraftClaimResponse = JSON.parse(cachedData);
    if (calculateTtlInSeconds(parsed.expiresAt) <= 0) {
      await deleteCachedDraft(userId, caseId);
      return null;
    }
    return parsed;
  } catch (err: unknown) {
    logger.warn(`[claimantResponseDraftRedisCache] redis read error for key ${key}: ${getErrorMessage(err)}`);
    return null;
  }
};

export const setCachedDraft = async (userId: string, caseId: string, data: DraftClaimResponse): Promise<void> => {
  const key = getRedisKey(userId, caseId);
  const ttlSeconds = calculateTtlInSeconds(data.expiresAt);
  if (ttlSeconds <= 0) {
    logger.warn(`[claimantResponseDraftRedisCache] skipping redis cache for ${key} because draft is expired`);
    return;
  }
  try {
    await app.locals.draftStoreClient.setex(key, ttlSeconds, JSON.stringify(data));
  } catch (err: unknown) {
    logger.warn(`[claimantResponseDraftRedisCache] failed to write cache for key ${key}: ${getErrorMessage(err)}`);
  }
};

export const deleteCachedDraft = async (userId: string, caseId: string): Promise<void> => {
  const key = getRedisKey(userId, caseId);
  try {
    await app.locals.draftStoreClient.del(key);
  } catch (err: unknown) {
    logger.warn(`[claimantResponseDraftRedisCache] failed to delete redis cache for key ${key}: ${getErrorMessage(err)}`);
  }
};
