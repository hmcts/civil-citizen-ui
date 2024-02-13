import {Request, Response, Router} from 'express';
import { BASE_ELIGIBILITY_URL, ELIGIBILITY_CLAIM_VALUE_URL, MAKE_CLAIM } from '../../../urls';
import { isCUIReleaseTwoEnabled } from '../../../../app/auth/launchdarkly/launchDarklyClient';
import config from 'config';

const tryNewServiceController = Router();

tryNewServiceController.get([BASE_ELIGIBILITY_URL, MAKE_CLAIM], async (req: Request, res: Response) => {
  const isCUIR2Enabled = await isCUIReleaseTwoEnabled();
  if (!isCUIR2Enabled) {
    const ocmcBaseUrl = config.get<string>('services.cmc.url');
    return res.redirect(`${ocmcBaseUrl}${BASE_ELIGIBILITY_URL}`);
  }
  res.render('features/public/eligibility/try-new-service', {urlNextView: ELIGIBILITY_CLAIM_VALUE_URL});
});

export default tryNewServiceController;
