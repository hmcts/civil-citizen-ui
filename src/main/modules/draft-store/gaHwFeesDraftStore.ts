import {app} from '../../app-instance';
import {GaHelpWithFees} from 'models/generalApplication/gaHelpWithFees';
import {TTLCategory} from './ttlConfig';
import {writeWithTTL} from './redisWriteHelper';

const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('draftStoreService');

export const saveDraftGAHWFDetails = async (redisKey: string, response: GaHelpWithFees) => {
  try {
    await writeWithTTL(redisKey, response, TTLCategory.GA_JOURNEY);
  } catch (err) {
    logger.error('issue on saving respondent response' + err);
    throw err;
  }
};

export const getDraftGAHWFDetails = async (redisKey: string): Promise<GaHelpWithFees> => {
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
  return Object.assign(new GaHelpWithFees(), jsonData);
};
