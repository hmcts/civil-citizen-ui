import {NextFunction, RequestHandler, Router} from 'express';
import {
  DASHBOARD_CLAIMANT_URL,
  HEARING_FEE_CANCEL_JOURNEY,
} from 'routes/urls';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {deleteDraftClaimFromStore, generateRedisKey} from 'modules/draft-store/draftStoreService';
import {AppRequest} from 'models/AppRequest';


const cancelHearingFeeJourneyController: Router = Router();

cancelHearingFeeJourneyController.get(HEARING_FEE_CANCEL_JOURNEY, (async (req, res, next: NextFunction) => {
  const claimId = req.params.id;

  const redisClaimId = generateRedisKey(<AppRequest>req);
  await deleteDraftClaimFromStore(redisClaimId);
  res.redirect(constructResponseUrlWithIdParams(claimId, DASHBOARD_CLAIMANT_URL));
}) as RequestHandler);

export default cancelHearingFeeJourneyController;
