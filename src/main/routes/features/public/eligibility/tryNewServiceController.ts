import {RequestHandler, Response, Router} from 'express';
import {BASE_ELIGIBILITY_URL, ELIGIBILITY_CLAIM_VALUE_URL, MAKE_CLAIM, CLAIM_BILINGUAL_LANGUAGE_PREFERENCE_URL} from '../../../urls';
import {isCUIReleaseTwoEnabled} from '../../../../app/auth/launchdarkly/launchDarklyClient';
import config from 'config';
import {AppRequest} from 'common/models/AppRequest';

const tryNewServiceController = Router();

tryNewServiceController.get([BASE_ELIGIBILITY_URL, MAKE_CLAIM], (async (req: AppRequest, res: Response) => {
  const isCUIR2Enabled = await isCUIReleaseTwoEnabled();
  const userId = req.session?.user?.id;
  if (!isCUIR2Enabled) {
    const ocmcBaseUrl = config.get<string>('services.cmc.url');
    return res.redirect(`${ocmcBaseUrl}${BASE_ELIGIBILITY_URL}`);
  }

  if(req.cookies['eligibilityCompleted'] && userId) {
    return res.redirect(CLAIM_BILINGUAL_LANGUAGE_PREFERENCE_URL);
  }

  res.render('features/public/eligibility/try-new-service', {urlNextView: ELIGIBILITY_CLAIM_VALUE_URL});
}) as RequestHandler);

export default tryNewServiceController;
