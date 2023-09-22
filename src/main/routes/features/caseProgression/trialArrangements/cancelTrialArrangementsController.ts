import {
  CANCEL_TRIAL_ARRANGEMENTS,
  DEFENDANT_SUMMARY_URL,
} from 'routes/urls';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {RequestHandler, Router} from 'express';
import {deleteDraftClaimFromStore} from 'modules/draft-store/draftStoreService';

const cancelTrialArrangementsController = Router();

cancelTrialArrangementsController.get([CANCEL_TRIAL_ARRANGEMENTS], (async (req, res, next) => {
  try {
    const claimId = req.params.id;
    await deleteDraftClaimFromStore(claimId);
    res.redirect(constructResponseUrlWithIdParams(claimId, DEFENDANT_SUMMARY_URL));
  } catch (error) {
    next(error);
  }
})as RequestHandler);

export default cancelTrialArrangementsController;
