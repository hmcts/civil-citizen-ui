import {AppRequest} from 'models/AppRequest';
import {NextFunction, Response} from 'express';
import {
  generateRedisKey,
  getCaseDataFromStore,
  saveDraftClaim,
} from 'modules/draft-store/draftStoreService';
import {refreshDraftStoreClaimFrom} from 'modules/utilityService';

export const redisDataFlushForDJ = async (req: AppRequest, res: Response, next: NextFunction) => {
  try {
    const redisKey = generateRedisKey(req);
    let claim = await getCaseDataFromStore(redisKey);
    if (claim.refreshDataForDJ) {
      claim = await refreshDraftStoreClaimFrom(req, true);
      claim.refreshDataForDJ = false;
      await saveDraftClaim(generateRedisKey(req), claim);
    }
    next();
  } catch (error) {
    next(error);
  }
};
