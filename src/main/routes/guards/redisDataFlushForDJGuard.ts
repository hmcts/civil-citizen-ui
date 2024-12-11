import {AppRequest} from 'models/AppRequest';
import {NextFunction, Response} from 'express';
import {
  deleteDraftClaimFromStore,
  generateRedisKey,
  getCaseDataFromStore,
  saveDraftClaim,
} from 'modules/draft-store/draftStoreService';
import {getClaimById} from 'modules/utilityService';

export const redisDataFlushForDJ = async (req: AppRequest, res: Response, next: NextFunction) => {
  try {
    let claim = await getCaseDataFromStore(generateRedisKey(req));
    if (claim.refreshDataForDJ) {
      await deleteDraftClaimFromStore(generateRedisKey(req));
      claim = await getClaimById(req.params.id, req, true);
      claim.refreshDataForDJ = false;
      await saveDraftClaim(generateRedisKey(req), claim);
    }
    next();
  } catch (error) {
    next(error);
  }
};
