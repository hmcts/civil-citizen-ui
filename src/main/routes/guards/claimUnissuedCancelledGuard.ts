import {NextFunction, RequestHandler, Response} from 'express';
import {AppRequest} from 'models/AppRequest';
import {getClaimById} from 'modules/utilityService';
import {getRouteParam} from 'common/utils/routeParamUtils';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {DASHBOARD_CLAIMANT_URL} from 'routes/urls';
import {isClaimUnissuedCancelled} from 'services/features/cancelUnissuedClaimSpec/cancelUnissuedClaimSpecService';

// Stops claim fee payment once the unissued claim has been cancelled
export const claimUnissuedCancelledGuard = (async (req: AppRequest, res: Response, next: NextFunction) => {
  try {
    const claimId = getRouteParam(req, 'id');
    const claim = await getClaimById(claimId, req, true);
    if (isClaimUnissuedCancelled(claim)) {
      res.redirect(constructResponseUrlWithIdParams(claimId, DASHBOARD_CLAIMANT_URL));
    } else {
      next();
    }
  } catch (error) {
    next(error);
  }
}) as RequestHandler;
