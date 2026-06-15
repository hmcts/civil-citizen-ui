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
    const existingTTL = await draftStoreClient.ttl(key);

    if (existingTTL > 0) {
      await draftStoreClient.set(key, serializedValue, 'KEEPTTL');
      logger.info(`Preserved existing TTL for key: ${key}, TTL: ${existingTTL}s`);
      return;
    }

    const expiryTimestamp = calculateExpiryTimestamp(category, metadata);
    await draftStoreClient.set(key, serializedValue);
    await draftStoreClient.expireat(key, expiryTimestamp);
    logger.info(
      `Applied TTL for key: ${key}, category: ${category}, expires: ${new Date(expiryTimestamp * 1000).toISOString()}`,
    );
  } catch (error) {
    logger.error(`Failed to write Redis key: ${key}, category: ${category}`, error);
    throw error;
  }
};
