import { app } from '../../../../../main/app';
import {isGeneralApplicationDraftDatabaseEnabled} from 'app/auth/launchdarkly/launchDarklyClient';
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
    const existing = await app.locals.draftStoreClient.get(redisKey);
    const databaseEnabled = await isGeneralApplicationDraftDatabaseEnabled();
    if (existing || !databaseEnabled) {
      await writeWithTTL(redisKey, response, TTLCategory.GA_JOURNEY, {
        creationDate: new Date(response.draftResponseCreatedAt),
      });
      // TODO REMOVE before merging
      logger.info(`TODO REMOVE general application response draft saved to redis because ${existing ? 'a draft is already there' : 'the database flag is off'}, key: ${redisKey}`);
      return;
    }
    await syncResponseDraft(response);
  } catch (err) {
    logger.error('issue on saving respondent response' + err);
    throw err;
  }
};

export const getDraftGARespondentResponse = async (redisKey: string): Promise<GaResponse> => {
  const dataFromRedis = await app.locals.draftStoreClient.get(redisKey);
  if (dataFromRedis) {
    // TODO REMOVE before merging
    logger.info(`TODO REMOVE general application response draft loaded from redis, key: ${redisKey}`);
    return convertRedisDataToGaRespondentResponse(dataFromRedis);
  }
  const durableResponse = await loadResponseDraft();
  if (durableResponse) {
    // TODO REMOVE before merging
    logger.info(`TODO REMOVE general application response draft loaded from database, key: ${redisKey}`);
    return durableResponse;
  }
  return convertRedisDataToGaRespondentResponse(dataFromRedis);
};

export const deleteDraftGARespondentResponseFromStore = async (redisKey: string): Promise<void> => {
  const existing = await app.locals.draftStoreClient.get(redisKey);
  await app.locals.draftStoreClient.del(redisKey);
  if (!existing) {
    await deleteDurableResponseDraft();
  }
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
