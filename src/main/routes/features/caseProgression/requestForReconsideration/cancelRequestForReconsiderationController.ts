import {
  DASHBOARD_CLAIMANT_URL,
  DEFENDANT_SUMMARY_URL,
  REQUEST_FOR_RECONSIDERATION_CANCEL_URL,
} from 'routes/urls';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {RequestHandler, Router} from 'express';
import {
  deleteFieldDraftClaimFromStore,
} from 'modules/draft-store/draftStoreService';
import {getClaimById} from 'modules/utilityService';

const cancelRequestForReconsiderationController = Router();

cancelRequestForReconsiderationController.get(REQUEST_FOR_RECONSIDERATION_CANCEL_URL, (async (req, res, next) => {
  try {
    const claimId = req.params.id;
    const propertyName = req.params.propertyName;
    const claim = await getClaimById(claimId, req, true);
    await deleteFieldDraftClaimFromStore(claimId, claim, propertyName);

    if (claim.isClaimant()){
      res.redirect(constructResponseUrlWithIdParams(claimId, DASHBOARD_CLAIMANT_URL));
    } else {
      res.redirect(constructResponseUrlWithIdParams(claimId, DEFENDANT_SUMMARY_URL));
    }
  } catch (error) {
    next(error);
  }
})as RequestHandler);

export default cancelRequestForReconsiderationController;
