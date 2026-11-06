import {NextFunction, RequestHandler, Response} from 'express';
import {AppRequest} from 'models/AppRequest';
import {getClaimById} from 'modules/utilityService';
import {getRouteParam} from 'common/utils/routeParamUtils';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {DASHBOARD_CLAIMANT_URL} from 'routes/urls';
import {isUnissuedClaimCancelled} from 'services/features/cancelUnissuedClaim/cancelUnissuedClaimService';
import {isEarlyClaimTerminationEnabled} from '../../app/auth/launchdarkly/launchDarklyClient';

// Stops claim fee payment once the unissued claim has been cancelled
export const unissuedClaimCancelledGuard = (async (req: AppRequest, res: Response, next: NextFunction) => {
  try {
    // Flag off: go straight to the payment routes, as before this feature
    if (!await isEarlyClaimTerminationEnabled()) {
      return next();
    }
    const claimId = getRouteParam(req, 'id');
    const claim = await getClaimById(claimId, req, true);
    if (isUnissuedClaimCancelled(claim)) {
      res.redirect(constructResponseUrlWithIdParams(claimId, DASHBOARD_CLAIMANT_URL));
    } else {
      next();
    }
  } catch (error) {
    next(error);
  }
}) as RequestHandler;
