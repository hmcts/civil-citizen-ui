import {NextFunction, RequestHandler, Router, Response} from 'express';
import {AppRequest} from 'models/AppRequest';
import { DASHBOARD_CLAIMANT_URL, OLD_DASHBOARD_CLAIMANT_URL} from '../../urls';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';

const claimantClaimSummaryController = Router();

claimantClaimSummaryController.get(OLD_DASHBOARD_CLAIMANT_URL, (async (req:AppRequest, res:Response, next: NextFunction) => {
  try {
    const claimId = req.params.id;
    res.redirect(constructResponseUrlWithIdParams(claimId, DASHBOARD_CLAIMANT_URL));
  } catch (error) {
    next(error);
  }
})as RequestHandler);

export default claimantClaimSummaryController;
