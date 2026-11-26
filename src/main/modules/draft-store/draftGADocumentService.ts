import { UploadGAFiles } from 'common/models/generalApplication/uploadGAFiles';
import {isGeneralApplicationDraftDatabaseEnabled} from 'app/auth/launchdarkly/launchDarklyClient';
import {app} from '../../app-instance';
import {TTLCategory} from './ttlConfig';
import {writeWithTTL} from './redisWriteHelper';
import {loadResponseDocuments, syncResponseDocuments} from './generalApplication/generalApplicationDraftSync';

const { Logger } = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('draftStoreService');
const docKey = 'DOCKEY';

const responseDraftRemainsInRedis = async (redisKey: string): Promise<boolean> => {
  const [existingResponse, existingDocuments] = await Promise.all([
    app.locals.draftStoreClient.get(redisKey),
    app.locals.draftStoreClient.get(redisKey + docKey),
  ]);
  return Boolean(existingResponse || existingDocuments) || !(await isGeneralApplicationDraftDatabaseEnabled());
};

export const saveGADocumentsInDraftStore = async (redisKey: string, uploadGAFiles: UploadGAFiles[]) => {
  try {
    if (await responseDraftRemainsInRedis(redisKey)) {
      await writeWithTTL(redisKey + docKey, uploadGAFiles, TTLCategory.GA_JOURNEY);
      // TODO REMOVE before merging
      logger.info(`TODO REMOVE general application document draft saved to redis, key: ${redisKey}`);
      return;
    }
    await syncResponseDocuments(uploadGAFiles);
  } catch (err) {
    logger.error('issue on saving GA draft documents' + err);
    throw err;
  }
};

export const getGADocumentsFromDraftStore = async (redisKey: string): Promise<UploadGAFiles[]> => {
  const documentKey = redisKey + docKey;
  const dataFromRedis = await app.locals.draftStoreClient.get(documentKey);
  if (dataFromRedis) {
    // TODO REMOVE before merging
    logger.info(`TODO REMOVE general application document draft loaded from redis, key: ${redisKey}`);
    return convertRedisDataToGaDocumentsResponse(dataFromRedis);
  }
  const durableDocuments = await loadResponseDocuments();
  if (durableDocuments) {
    // TODO REMOVE before merging
    logger.info(`TODO REMOVE general application document draft loaded from database, key: ${redisKey}`);
    return durableDocuments;
  }
  return convertRedisDataToGaDocumentsResponse(dataFromRedis);
};

const convertRedisDataToGaDocumentsResponse = (data: string) => {
  let jsonData = undefined;
  if (data) {
    try {
      jsonData = JSON.parse(data);
      return jsonData;
    } catch (err: unknown) {
      logger.error(`${(err as Error).stack || err}`);
    }
  }
  return [];
};
export const deleteGADocumentsFromDraftStore = async (redisKey: string): Promise<void> => {
  const documentKey = redisKey + docKey;
  const existingDocuments = await app.locals.draftStoreClient.get(documentKey);
  await app.locals.draftStoreClient.del(documentKey);
  if (!existingDocuments) {
    await syncResponseDocuments([]);
  }
};
