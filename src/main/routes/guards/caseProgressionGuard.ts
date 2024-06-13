import { NextFunction, Request, Response } from 'express';
import { isCaseProgressionV1Enable } from 'app/auth/launchdarkly/launchDarklyClient';
import { Claim } from 'common/models/claim';
import { getClaimById } from 'modules/utilityService';
import { getCancelUrl } from 'services/features/generalApplication/generalApplicationService';

export const isCaseProgressionV1Enabled = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  const isCPFlagEnable = await isCaseProgressionV1Enable();
  if (isCPFlagEnable) {
    next();
  } else {
    const claim: Claim = await getClaimById(req.params.id, req, true);
    res.redirect(await getCancelUrl(req.params.id, claim));
  }
};
