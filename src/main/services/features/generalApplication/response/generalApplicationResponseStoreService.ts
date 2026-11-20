import { app } from '../../../../../main/app';
import { GaResponse } from 'common/models/generalApplication/response/gaResponse';
import { TTLCategory } from 'modules/draft-store/ttlConfig';
import { writeWithTTL } from 'modules/draft-store/redisWriteHelper';
import {
  deleteDurableResponseDraft,
  loadResponseDraft,
  syncResponseDraft,
} from 'modules/draft-store/generalApplication/generalApplicationDraftSync';

const { Logger } = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('draftStoreService');

export const saveDraftGARespondentResponse = async (redisKey: string, response: GaResponse) => {
  try {
    if (!response.draftResponseCreatedAt) {
      response.draftResponseCreatedAt = new Date();
    }
    await writeWithTTL(redisKey, response, TTLCategory.GA_JOURNEY, {
      creationDate: new Date(response.draftResponseCreatedAt),
    });
    await syncResponseDraft(response);
  } catch (err) {
    logger.error('issue on saving respondent response' + err);
    throw err;
  }
};

export const getDraftGARespondentResponse = async (redisKey: string): Promise<GaResponse> => {
  const dataFromRedis = await app.locals.draftStoreClient.get(redisKey);
  if (dataFromRedis) {
    return convertRedisDataToGaRespondentResponse(dataFromRedis);
  }
  const durableResponse = await loadResponseDraft();
  if (!durableResponse) {
    return convertRedisDataToGaRespondentResponse(dataFromRedis);
  }
  await writeWithTTL(redisKey, durableResponse, TTLCategory.GA_JOURNEY, {
    creationDate: durableResponse.draftResponseCreatedAt
      ? new Date(durableResponse.draftResponseCreatedAt)
      : undefined,
    overrideExistingTTL: true,
  });
  return durableResponse;
};

export const deleteDraftGARespondentResponseFromStore = async (redisKey: string): Promise<void> => {
  await app.locals.draftStoreClient.del(redisKey);
  await deleteDurableResponseDraft();
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
