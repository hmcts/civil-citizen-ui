import {NextFunction, RequestHandler, Response} from 'express';
import {AppRequest} from 'models/AppRequest';
import {getClaimById} from 'modules/utilityService';
import {getRouteParam} from 'common/utils/routeParamUtils';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {DASHBOARD_CLAIMANT_URL} from 'routes/urls';
import {isCancelUnissuedClaimAvailable} from 'services/features/cancelUnissuedClaim/cancelUnissuedClaimService';
import {isEarlyClaimTerminationEnabled} from '../../app/auth/launchdarkly/launchDarklyClient';

const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('cancelUnissuedClaimGuard');

export const cancelUnissuedClaimGuard = (async (req: AppRequest, res: Response, next: NextFunction) => {
  try {
    const claimId = getRouteParam(req, 'id');
    const earlyClaimTerminationEnabled = await isEarlyClaimTerminationEnabled();
    logger.info(`cancelUnissuedClaimGuard: early-claim-termination flag is ${earlyClaimTerminationEnabled ? 'ON' : 'OFF'} for claimId ${claimId}`);
    if (!earlyClaimTerminationEnabled) {
      return res.redirect(constructResponseUrlWithIdParams(claimId, DASHBOARD_CLAIMANT_URL));
    }
    const claim = await getClaimById(claimId, req, true);
    if (isCancelUnissuedClaimAvailable(claim)) {
      next();
    } else {
      res.redirect(constructResponseUrlWithIdParams(claimId, DASHBOARD_CLAIMANT_URL));
    }
  } catch (error) {
    next(error);
  }
}) as RequestHandler;
