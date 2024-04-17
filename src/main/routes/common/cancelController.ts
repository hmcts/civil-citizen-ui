import {CANCEL_URL, DASHBOARD_CLAIMANT_URL, DEFENDANT_SUMMARY_URL} from 'routes/urls';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {RequestHandler, Router} from 'express';
import {
  deleteFieldDraftClaimFromStore, generateRedisKey,
} from 'modules/draft-store/draftStoreService';
import {getClaimById} from 'modules/utilityService';
import {AppRequest} from 'models/AppRequest';

const cancelController = Router();

cancelController.get(CANCEL_URL, (async (req, res, next) => {
  try {
    const claimId = req.params.id;
    const redisKey = generateRedisKey(<AppRequest>req);
    const propertyName = req.params.propertyName;
    const claim = await getClaimById(redisKey, req);
    await deleteFieldDraftClaimFromStore(redisKey, claim, propertyName);

    if (claim.isClaimant()){
      res.redirect(constructResponseUrlWithIdParams(claimId, DASHBOARD_CLAIMANT_URL));
    } else {
      res.redirect(constructResponseUrlWithIdParams(claimId, DEFENDANT_SUMMARY_URL));
    }
  } catch (error) {
    next(error);
  }
})as RequestHandler);

export default cancelController;
