import {app} from '../../app-instance';
import {isGeneralApplicationDraftDatabaseEnabled} from 'app/auth/launchdarkly/launchDarklyClient';
import {GaHelpWithFees} from 'models/generalApplication/gaHelpWithFees';
import {TTLCategory} from './ttlConfig';
import {writeWithTTL} from './redisWriteHelper';
import {loadHelpWithFeesDraft, syncHelpWithFeesDraft} from './generalApplication/generalApplicationDraftSync';

const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('draftStoreService');

export const saveDraftGAHWFDetails = async (redisKey: string, response: GaHelpWithFees) => {
  try {
    const existing = await app.locals.draftStoreClient.get(redisKey);
    const databaseEnabled = await isGeneralApplicationDraftDatabaseEnabled();
    if (existing || !databaseEnabled) {
      await writeWithTTL(redisKey, response, TTLCategory.GA_JOURNEY);
      return;
    }
    await syncHelpWithFeesDraft(response);
  } catch (err) {
    logger.error('issue on saving respondent response' + err);
    throw err;
  }
};

export const getDraftGAHWFDetails = async (redisKey: string): Promise<GaHelpWithFees> => {
  const dataFromRedis = await app.locals.draftStoreClient.get(redisKey);
  if (dataFromRedis) {
    return convertRedisDataToGaRespondentResponse(dataFromRedis);
  }
  const durableHelpWithFees = await loadHelpWithFeesDraft();
  if (durableHelpWithFees) {
    return durableHelpWithFees;
  }
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
  return Object.assign(new GaHelpWithFees(), jsonData);
};
