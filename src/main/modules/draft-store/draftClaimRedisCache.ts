import {app} from '../../app-instance';
import {DraftClaimResponse} from 'common/models/draft/draftClaim';

const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('draftClaimCache');

const getErrorMessage = (error: unknown): string =>
  error instanceof Error ? error.message : String(error);

export const getRedisKey = (userId: string): string => `draft-claim:${userId}`;

export const calculateTtlInSeconds = (expiresAtISO: string): number => {
  const expiresAt = new Date(expiresAtISO).getTime();
  const now = Date.now();
  const diffInSeconds = Math.floor((expiresAt - now) / 1000);
  return diffInSeconds > 0 ? diffInSeconds : 0;
};

export const getCachedDraft = async (userId: string): Promise<DraftClaimResponse | null> => {
  const key = getRedisKey(userId);
  try {
    const cachedData = await app.locals.draftStoreClient.get(key);
    if (cachedData) {
      const parsed: DraftClaimResponse = JSON.parse(cachedData);

      const ttlSeconds = calculateTtlInSeconds(parsed.expiresAt);
      if (ttlSeconds <= 0) {
        await deleteCachedDraft(userId);
        return null;
      }
      return parsed;
    }
    return null;
  } catch (err: any) {
    logger.warn(`[draftClaimRedisCache] redis read error for key ${key}: ${getErrorMessage(err)}`);
    return null;
  }
};

export const setCachedDraft = async (userId: string, data: DraftClaimResponse): Promise<void> => {
  const key = getRedisKey(userId);
  const ttlSeconds = calculateTtlInSeconds(data.expiresAt);

  if (ttlSeconds <= 0) {
    logger.warn(`[draftClaimRedisCache] skipping redis cache for ${key} because draft is expired`);
    return;
  }

  try {
    const jsonString = JSON.stringify(data);
    await app.locals.draftStoreClient.setex(key, ttlSeconds, jsonString);
  } catch (err: unknown) {
    logger.warn(`[draftClaimRedisCache] failed to write cache for key ${key}: ${getErrorMessage(err)}`);
  }
};

export const deleteCachedDraft = async (userId: string): Promise<void> => {
  const key = getRedisKey(userId);
  try {
    await app.locals.draftStoreClient.del(key);
  } catch (err: unknown) {
    logger.warn(`[draftClaimRedisCache] failed to delete redis cache for key ${key}: ${getErrorMessage(err)}`);
  }
};
