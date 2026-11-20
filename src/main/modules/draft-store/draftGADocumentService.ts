import { UploadGAFiles } from 'common/models/generalApplication/uploadGAFiles';
import {app} from '../../app-instance';
import {TTLCategory} from './ttlConfig';
import {writeWithTTL} from './redisWriteHelper';
import {loadResponseDocuments, syncResponseDocuments} from './generalApplication/generalApplicationDraftSync';

const { Logger } = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('draftStoreService');
const docKey = 'DOCKEY';

export const saveGADocumentsInDraftStore = async (redisKey: string, uploadGAFiles: UploadGAFiles[]) => {
  try {
    redisKey += docKey;
    await writeWithTTL(redisKey, uploadGAFiles, TTLCategory.GA_JOURNEY);
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
    return convertRedisDataToGaDocumentsResponse(dataFromRedis);
  }
  const durableDocuments = await loadResponseDocuments();
  if (!durableDocuments) {
    return convertRedisDataToGaDocumentsResponse(dataFromRedis);
  }
  await writeWithTTL(documentKey, durableDocuments, TTLCategory.GA_JOURNEY);
  return durableDocuments;
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
  redisKey += docKey;
  await app.locals.draftStoreClient.del(redisKey);
  await syncResponseDocuments([]);
};
