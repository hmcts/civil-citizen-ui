import {CANCEL_URL} from 'routes/urls';
import {RequestHandler, Router} from 'express';
import {
  deleteFieldDraftClaimFromStore, generateRedisKey,
} from 'modules/draft-store/draftStoreService';
import {getClaimById} from 'modules/utilityService';
import {AppRequest} from 'models/AppRequest';
import {getRouteParam} from 'common/utils/routeParamUtils';
import {getDashboardUrlForParty} from 'services/features/generalApplication/generalApplicationService';

const cancelController = Router();

cancelController.get(CANCEL_URL, (async (req, res, next) => {
  try {
    const claimId = getRouteParam(req, 'id');
    const redisKey = generateRedisKey(<AppRequest>req);
    const propertyName = getRouteParam(req, 'propertyName');
    const claim = await getClaimById(claimId, req, true);
    await deleteFieldDraftClaimFromStore(redisKey, claim, propertyName, (<AppRequest>req).session.user?.id);
    res.redirect(getDashboardUrlForParty(claimId, claim));
  } catch (error) {
    next(error);
  }
})as RequestHandler);

export default cancelController;
