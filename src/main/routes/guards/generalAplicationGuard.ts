import { NextFunction, Request, Response } from 'express';
import { isGaForLipsEnabled } from 'app/auth/launchdarkly/launchDarklyClient';
import { getCancelUrl } from 'services/features/generalApplication/generalApplicationService';
import {AppRequest} from 'models/AppRequest';
import {getClaimById} from 'modules/utilityService';

export const isGAForLiPEnabled = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  const isGAFlagEnable = await isGaForLipsEnabled();
  const claim = await getClaimById(req.params.id, <AppRequest>req);
  //If the application was originally created in English and the respondent replied in Welsh,
  // a new application will not be generated; however, the existing application will still be accessible online.
  const allowAppAccess = claim.generalApplications?.length > 0 ;
  const coscUrl: string[] = ['/cosc/', '/apply-help-fee-selection', '/payment-successful', '/payment-unsuccessful', '/upload-documents', '/summary']
  if(isGAFlagEnable && coscUrl.some(url => req.url.includes(url)) || allowAppAccess) {
    next();
  } else if (isGAFlagEnable && !claim.isAnyPartyBilingual() || allowAppAccess) {
    next();
  } else {
    res.redirect(await getCancelUrl(req.params.id, claim));
  }
};
