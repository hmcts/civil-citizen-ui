import { UploadGAFiles } from 'common/models/generalApplication/uploadGAFiles';
import {app} from '../../app';
const { Logger } = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('draftStoreService');
export const saveGADocumentsInDraftStore = async (redisKey: string, uploadGAFiles: UploadGAFiles[]) => {
  try {
    const draftStoreClient = app.locals.draftStoreClient;
    draftStoreClient.set(redisKey, JSON.stringify(uploadGAFiles));
  } catch (err) {
    logger.error('issue on saving GA draft documents' + err);
    throw err;
  }
};
export const getGADocumentsFromDraftStore = async (redisKey: string): Promise<UploadGAFiles[]> => {
  const dataFromRedis = await app.locals.draftStoreClient.get(redisKey);
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
