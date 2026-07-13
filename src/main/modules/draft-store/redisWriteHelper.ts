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
  prefetchedTTL?: number,
): Promise<void> => {
  if (value === null || value === undefined) {
    throw new Error('Redis value cannot be null or undefined');
  }

  const draftStoreClient = app.locals.draftStoreClient;
  const serializedValue = serializeValue(value);

  try {
    const existingTTL = prefetchedTTL !== undefined ? prefetchedTTL : await draftStoreClient.ttl(key);

    if (existingTTL > 0) {
      await draftStoreClient.set(key, serializedValue, 'KEEPTTL');
      logger.info(`Preserved existing TTL for key: ${key}, TTL: ${existingTTL}s`);
      return;
    }

    const expiryTimestamp = calculateExpiryTimestamp(category, metadata);
    // Atomic write + relative expiry (EX) so a key can never be left without a
    // TTL if the process dies between the write and the expiry call. EX is
    // supported on every Redis version (unlike EXAT, which needs >= 6.2).
    // Clamp to >= 1s to guard against an already-elapsed expiry (e.g. a draft
    // anchored to an old creation date), which would be an invalid EX value.
    const ttlSeconds = Math.max(1, expiryTimestamp - Math.floor(Date.now() / 1000));
    await draftStoreClient.set(key, serializedValue, 'EX', ttlSeconds);
    logger.info(
      `Applied TTL for key: ${key}, category: ${category}, expires in: ${ttlSeconds}s`,
    );
  } catch (error) {
    logger.error(`Failed to write Redis key: ${key}, category: ${category}`, error);
    throw error;
  }
};
