import {NextFunction, RequestHandler, Router} from 'express';
import {
  DASHBOARD_CLAIMANT_URL,
  HEARING_FEE_CANCEL_JOURNEY,
} from 'routes/urls';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {deleteDraftClaimFromStore} from 'modules/draft-store/draftStoreService';

const cancelHearingFeeJourneyController: Router = Router();

cancelHearingFeeJourneyController.get([HEARING_FEE_CANCEL_JOURNEY], (async (req, res, next: NextFunction) => {
  try {
    const claimId = req.params.id;
    await deleteDraftClaimFromStore(claimId);
    res.redirect(constructResponseUrlWithIdParams(claimId, DASHBOARD_CLAIMANT_URL));
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

export default cancelHearingFeeJourneyController;
