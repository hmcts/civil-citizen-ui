import { app } from '../../../../../main/app';
import { GaResponse } from 'common/models/generalApplication/response/gaResponse';
import { calculateExpireTimeForDraftClaimInSeconds } from 'common/utils/dateUtils';

const { Logger } = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('draftStoreService');

export const saveDraftGARespondentResponse = async (redisKey: string, response: GaResponse) => {
  try {
    const draftStoreClient = app.locals.draftStoreClient;
    draftStoreClient.set(redisKey, JSON.stringify(response));
    if (response.draftResponseCreatedAt) {
      await draftStoreClient.expireat(redisKey, calculateExpireTimeForDraftClaimInSeconds(response.draftResponseCreatedAt));
    }
  } catch (err) {
    logger.error('issue on saving respondent response' + err);
    throw err;
  }
};

export const getDraftGARespondentResponse = async (redisKey: string): Promise<GaResponse> => {
  const dataFromRedis = await app.locals.draftStoreClient.get(redisKey);
  return convertRedisDataToGaRespondentResponse(dataFromRedis);
};

const convertRedisDataToGaRespondentResponse = (data: string) => {
  let jsonData = undefined;
  if (data) {
    try {
      jsonData = JSON.parse(data);
    } catch (err: unknown) {
      logger.error(`${(err as Error).stack || err}`);
    }
  }
  return Object.assign(new GaResponse(), jsonData);
};