import {Request} from 'express';
import {AppRequest} from 'common/models/AppRequest';
import {Claim} from 'common/models/claim';
import {generateRedisKey, getCaseDataFromStore} from 'modules/draft-store/draftStoreService';

const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('claimRequestLocals');

export const stashClaimOnRequest = (req: Request, claim: Claim): void => {
  const appReq = <AppRequest>req;
  appReq.locals = appReq.locals ?? {env: '', lang: ''};
  appReq.locals.claim = claim;
  logger.info(`[duplicate-redis-check] claimRequestLocals: stashed claim on request locals, ${req.method} ${req.originalUrl}`);
};

export const getStashedClaimOrFromStore = async (req: Request, redisKey?: string): Promise<Claim> => {
  const appReq = <AppRequest>req;
  if (appReq.locals?.claim) {
    logger.info(`[duplicate-redis-check] claimRequestLocals: getStashedClaimOrFromStore (stashed claim reused), ${req.method} ${req.originalUrl}`);
    return appReq.locals.claim;
  }
  const resolvedRedisKey = redisKey ?? generateRedisKey(appReq);
  logger.info(`[duplicate-redis-check] claimRequestLocals: getStashedClaimOrFromStore, getCaseDataFromStore, redisKey=${resolvedRedisKey}, ${req.method} ${req.originalUrl}`);
  return getCaseDataFromStore(resolvedRedisKey);
};
