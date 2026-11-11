import {NextFunction, RequestHandler, Response} from 'express';
import {AppRequest} from 'models/AppRequest';
import {getClaimById} from 'modules/utilityService';
import {getRouteParam} from 'common/utils/routeParamUtils';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {DASHBOARD_CLAIMANT_URL} from 'routes/urls';
import {isUnissuedClaimCancelled} from 'services/features/cancelUnissuedClaim/cancelUnissuedClaimService';
import {isEarlyClaimTerminationEnabled} from '../../app/auth/launchdarkly/launchDarklyClient';

const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('unissuedClaimCancelledGuard');

// Stops claim fee payment once the unissued claim has been cancelled
export const unissuedClaimCancelledGuard = (async (req: AppRequest, res: Response, next: NextFunction) => {
  try {
    const claimId = getRouteParam(req, 'id');
    const earlyClaimTerminationEnabled = await isEarlyClaimTerminationEnabled();
    logger.info(`unissuedClaimCancelledGuard: early-claim-termination flag is ${earlyClaimTerminationEnabled ? 'ON' : 'OFF'} for claimId ${claimId}`);
    // Flag off: go straight to the payment routes, as before this feature
    if (!earlyClaimTerminationEnabled) {
      return next();
    }
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
