import {app} from '../../app-instance';
import {TTLCategory, TTLMetadata, calculateExpiryTimestamp} from './ttlConfig';

const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('redisWriteHelper');

const serializeValue = (value: string | object): string =>
  typeof value === 'string' ? value : JSON.stringify(value);

export const writeWithTTL = async (
  key: string,
  value: string | object,
  category: TTLCategory,
  metadata?: TTLMetadata,
): Promise<void> => {
  if (value === null || value === undefined) {
    throw new Error('Redis value cannot be null or undefined');
  }

  const draftStoreClient = app.locals.draftStoreClient;
  const serializedValue = serializeValue(value);

  try {
    const expiryTimestamp = calculateExpiryTimestamp(category, metadata);
    // Clamp to >= 1s to guard against an already-elapsed expiry (e.g. a draft
    // anchored to an old creation date), which would be an invalid EX value.
    const ttlSeconds = Math.max(1, expiryTimestamp - Math.floor(Date.now() / 1000));

    // NX+EX and XX+KEEPTTL are each atomic at the Redis level, so there's no
    // window between reading the TTL and writing where a concurrent write can
    // race us — unlike a separate ttl() read followed by a conditional set().
    // Try to create the key fresh (NX) with a brand-new TTL; if it already
    // exists, NX fails and we fall back to overwriting it while preserving
    // whatever TTL it currently has (XX+KEEPTTL never resets the value of a
    // key that doesn't exist, so this can't accidentally create an
    // unexpiring key).
    const created = await draftStoreClient.set(key, serializedValue, 'EX', ttlSeconds, 'NX');
    if (created) {
      logger.info(
        `Applied TTL for key: ${key}, category: ${category}, expires in: ${ttlSeconds}s`,
      );
      return;
    }

    const updated = await draftStoreClient.set(key, serializedValue, 'KEEPTTL', 'XX');
    if (updated) {
      logger.info(`Preserved existing TTL for key: ${key}`);
      return;
    }

    // The key was deleted between the NX and XX attempts (rare concurrent
    // delete) — retry once as a fresh create now that it's definitely gone.
    await draftStoreClient.set(key, serializedValue, 'EX', ttlSeconds);
    logger.info(
      `Applied TTL for key: ${key}, category: ${category}, expires in: ${ttlSeconds}s (after concurrent delete)`,
    );
  } catch (error) {
    logger.error(`Failed to write Redis key: ${key}, category: ${category}`, error);
    throw error;
  }
};
