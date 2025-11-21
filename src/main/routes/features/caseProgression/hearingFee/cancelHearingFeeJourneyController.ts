import { RequestHandler, Router} from 'express';
import {
  DASHBOARD_CLAIMANT_URL,
  HEARING_FEE_CANCEL_JOURNEY,
} from 'routes/urls';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {deleteDraftClaim} from 'modules/draft-store/draftStoreService';

const cancelHearingFeeJourneyController: Router = Router();

cancelHearingFeeJourneyController.get(HEARING_FEE_CANCEL_JOURNEY, (async (req, res) => {
  await deleteDraftClaim(req);
  const claimId = req.params.id;
  res.redirect(constructResponseUrlWithIdParams(claimId, DASHBOARD_CLAIMANT_URL));
}) as RequestHandler);

export default cancelHearingFeeJourneyController;
