import { NextFunction, Request, Response } from 'express';
import { isGaForLipsEnabled } from 'app/auth/launchdarkly/launchDarklyClient';
import { getCancelUrl } from 'services/features/generalApplication/generalApplicationService';
import {AppRequest} from 'models/AppRequest';
import {getClaimById} from 'modules/utilityService';
import {getRouteParam} from 'common/utils/routeParamUtils';

export const isGAForLiPEnabled = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  const isGAFlagEnable = await isGaForLipsEnabled();
  const claimId = getRouteParam(req, 'id');
  const claim = await getClaimById(claimId, <AppRequest>req, true);
  const allowAppAccess = claim.generalApplications?.length > 0;

  if (isGAFlagEnable || allowAppAccess) {
    next();
  } else {
    res.redirect(await getCancelUrl(claimId, claim));
  }
};
