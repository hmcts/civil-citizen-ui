import {RequestHandler, Response, Router} from 'express';
import {
  BASE_ELIGIBILITY_URL,
  ELIGIBILITY_CLAIM_VALUE_URL,
  MAKE_CLAIM,
  CLAIM_BILINGUAL_LANGUAGE_PREFERENCE_URL,
  ELIGIBILITY_KNOWN_CLAIM_AMOUNT_URL,
} from '../../../urls';
import {isCUIReleaseTwoEnabled, isMintiEnabled} from '../../../../app/auth/launchdarkly/launchDarklyClient';
import config from 'config';
import {AppRequest} from 'common/models/AppRequest';

const tryNewServiceController = Router();
const pageTitle= 'PAGES.TRY_NEW_SERVICE.PAGE_TITLE';

tryNewServiceController.get([BASE_ELIGIBILITY_URL, MAKE_CLAIM], (async (req: AppRequest, res: Response) => {
  const isCUIR2Enabled = await isCUIReleaseTwoEnabled();
  const mintiEnabled = await isMintiEnabled();
  const userId = req.session?.user?.id;
  if (!isCUIR2Enabled) {
    const ocmcBaseUrl = config.get<string>('services.cmc.url');
    return res.redirect(`${ocmcBaseUrl}${BASE_ELIGIBILITY_URL}`);
  }

  if(req.cookies['eligibilityCompleted'] && userId) {
    return res.redirect(CLAIM_BILINGUAL_LANGUAGE_PREFERENCE_URL);
  }
  if (mintiEnabled) {
    res.render('features/public/eligibility/try-new-service', {urlNextView: ELIGIBILITY_KNOWN_CLAIM_AMOUNT_URL, pageTitle});
  } else {
    res.render('features/public/eligibility/try-new-service', {urlNextView: ELIGIBILITY_CLAIM_VALUE_URL, pageTitle});
  }
}) as RequestHandler);

export default tryNewServiceController;
