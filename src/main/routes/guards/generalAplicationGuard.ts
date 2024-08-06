import { NextFunction, Request, Response } from 'express';
import { isGaForLipsEnabled } from 'app/auth/launchdarkly/launchDarklyClient';
import { Claim } from 'common/models/claim';
import { getClaimById } from 'modules/utilityService';
import { getCancelUrl } from 'services/features/generalApplication/generalApplicationService';

export const isGAForLiPEnabled = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  const isGAFlagEnable = await isGaForLipsEnabled();
  if (isGAFlagEnable) {
    next();
  } else {
    const claim: Claim = await getClaimById(req.params.id, req, true);
    res.redirect(await getCancelUrl(req.params.id, claim));
  }
};