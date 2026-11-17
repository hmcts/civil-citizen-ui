import {NextFunction, Request, Response, Router} from 'express';
import {
  BREATHING_SPACE_LIFT_URL,
  LIFT_BREATHING_SPACE_EXIT_URL,
  DASHBOARD_URL,
  CYA_LIFT_BREATHING_SPACE_URL
} from '../../urls';
import {getHelpSupportLinks, getHelpSupportTitle} from 'services/dashboard/dashboardService';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {getClaimById} from 'modules/utilityService';
import {generateRedisKey, saveDraftClaim} from 'modules/draft-store/draftStoreService';
import {t} from 'i18next';
import {AppRequest} from 'models/AppRequest';

const liftBreathingSpaceExitController = Router();
const liftBreathingSpaceExitViewPath = 'features/breathingSpace/lift-exit';

const renderExitPage = (res: Response, claimId: string, helpSupportTitle: string, helpSupportLinks: unknown[], backLinkUrl: string, returnUrl: string, errors?: object) => {
  res.render(liftBreathingSpaceExitViewPath, {
    claimId,
    helpSupportTitle,
    helpSupportLinks,
    backLinkUrl,
    returnUrl,
    errors,
  });
};

const getSafeReturnUrl = (claimId: string, returnUrl: unknown): string => {
  const defaultReturnUrl = constructResponseUrlWithIdParams(claimId, BREATHING_SPACE_LIFT_URL);

  if (typeof returnUrl !== 'string') {
    return defaultReturnUrl;
  }

  const allowedReturnUrls = [
    defaultReturnUrl,
    constructResponseUrlWithIdParams(claimId, CYA_LIFT_BREATHING_SPACE_URL), // replace with your actual check-answers route constant
  ];

  if (!URL.canParse(returnUrl, 'http://localhost')) {
    return defaultReturnUrl;
  }

  const parsedUrl = new URL(returnUrl, 'http://localhost');
  if (parsedUrl.origin === 'http://localhost' && allowedReturnUrls.includes(parsedUrl.pathname)) {
    return `${parsedUrl.pathname}${parsedUrl.search}`;
  }

  return defaultReturnUrl;
};

liftBreathingSpaceExitController.get(LIFT_BREATHING_SPACE_EXIT_URL, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const claimId = req.params.id as string;
    const lang = req.query.lang ? req.query.lang : req.cookies.lang;
    const helpSupportTitle = getHelpSupportTitle(lang);
    const helpSupportLinks = getHelpSupportLinks(lang);
    const backLinkUrl = constructResponseUrlWithIdParams(claimId, BREATHING_SPACE_LIFT_URL);
    const returnUrl = getSafeReturnUrl(claimId, req.query.returnUrl);
    renderExitPage(res, claimId, helpSupportTitle, helpSupportLinks, backLinkUrl, returnUrl);
  } catch (error) {
    next(error);
  }
});

liftBreathingSpaceExitController.post(LIFT_BREATHING_SPACE_EXIT_URL, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const claimId = req.params.id as string;
    const lang = req.query.lang ? req.query.lang : req.cookies.lang;
    const {option, returnUrl} = req.body;
    const safeReturnUrl = getSafeReturnUrl(claimId, returnUrl);
    if (!option) {
      const helpSupportTitle = getHelpSupportTitle(lang);
      const helpSupportLinks = getHelpSupportLinks(lang);
      const backLinkUrl = constructResponseUrlWithIdParams(claimId, BREATHING_SPACE_LIFT_URL);
      const errorMessage = t('PAGES.BREATHING_SPACE.LIFT.EXIT.OPTION_REQUIRED', {lng: lang as string});
      const errors = {
        errorSummaryList: [{text: errorMessage, href: '#option'}],
        optionError: {text: errorMessage},
      };
      renderExitPage(res, claimId, helpSupportTitle, helpSupportLinks, backLinkUrl, safeReturnUrl, errors);
      return;
    }
    if (option === 'yes') {
      const claim = await getClaimById(claimId, req, true);
      if (claim.breathingSpace) {
        claim.breathingSpace.liftBreathing = undefined;
        await saveDraftClaim(generateRedisKey(req as AppRequest), claim);
      }
      res.redirect(constructResponseUrlWithIdParams(claimId, DASHBOARD_URL));
    } else {
      res.redirect(safeReturnUrl);
    }
  } catch (error) {
    next(error);
  }
});

export default liftBreathingSpaceExitController;
