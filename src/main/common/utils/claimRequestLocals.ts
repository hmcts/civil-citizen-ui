import {Request} from 'express';
import {AppRequest} from 'common/models/AppRequest';
import {Claim} from 'common/models/claim';
import {generateRedisKey, getCaseDataFromStore} from 'modules/draft-store/draftStoreService';

const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('claimRequestLocals');

export const stashClaimOnRequest = (req: Request, claim: Claim, source: string): void => {
  const appReq = <AppRequest>req;
  appReq.locals = appReq.locals ?? {env: '', lang: ''};
  appReq.locals.claim = claim;
  logger.info(`[locals-claim] stashed claim on req.locals from ${source}, ${req.method} ${req.originalUrl}`);
};

export const getStashedClaimOrFromStore = async (req: Request, source: string): Promise<Claim> => {
  const appReq = <AppRequest>req;
  if (appReq.locals?.claim) {
    logger.info(`[locals-claim] using req.locals.claim, skipping Redis, source=${source}, ${req.method} ${req.originalUrl}`);
    return appReq.locals.claim;
  }
  const redisKey = generateRedisKey(appReq);
  logger.info(`[duplicate-redis-check] ${source}: getCaseDataFromStore, redisKey=${redisKey}, ${req.method} ${req.originalUrl}`);
  return getCaseDataFromStore(redisKey);
};
