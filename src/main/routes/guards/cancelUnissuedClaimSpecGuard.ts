import {NextFunction, RequestHandler, Response} from 'express';
import {AppRequest} from 'models/AppRequest';
import {getClaimById} from 'modules/utilityService';
import {getRouteParam} from 'common/utils/routeParamUtils';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {DASHBOARD_CLAIMANT_URL} from 'routes/urls';
import {isCancelUnissuedClaimSpecAvailable} from 'services/features/cancelUnissuedClaimSpec/cancelUnissuedClaimSpecService';

export const cancelUnissuedClaimSpecGuard = (async (req: AppRequest, res: Response, next: NextFunction) => {
  try {
    const claimId = getRouteParam(req, 'id');
    const claim = await getClaimById(claimId, req, true);
    if (isCancelUnissuedClaimSpecAvailable(claim)) {
      next();
    } else {
      res.redirect(constructResponseUrlWithIdParams(claimId, DASHBOARD_CLAIMANT_URL));
    }
  } catch (error) {
    next(error);
  }
}) as RequestHandler;
