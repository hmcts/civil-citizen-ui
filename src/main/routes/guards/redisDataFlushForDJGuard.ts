import {AppRequest} from 'models/AppRequest';
import {NextFunction, Response} from 'express';
import {
  generateRedisKey,
  getCaseDataFromStore,
  saveDraftClaim,
} from 'modules/draft-store/draftStoreService';
import {refreshDraftStoreClaimFrom} from 'modules/utilityService';
const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('redisDataFlushForDJGuard');

export const redisDataFlushForDJ = async (req: AppRequest, res: Response, next: NextFunction) => {
  try {
    const redisKey = generateRedisKey(req);
    let claim = await getCaseDataFromStore(redisKey);
    logger.info(`Before refresh claim : claim.refreshDataForDJ: ${claim.refreshDataForDJ} redisKey: ${redisKey} ${claim.claimantResponse}`);
    if (claim.refreshDataForDJ) {
      logger.info(`Refreshing claim : redisKey: ${redisKey} ${claim.claimantResponse}`);
      claim = await refreshDraftStoreClaimFrom(req, true);
      claim.refreshDataForDJ = false;
      logger.info(`After refresh claim : redisKey: ${redisKey} ${claim.claimantResponse}`);
      await saveDraftClaim(generateRedisKey(req), claim);
    }
    next();
  } catch (error) {
    next(error);
  }
};
