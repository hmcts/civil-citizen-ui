import {NextFunction, Request, Response, Router} from 'express';
import {LIFT_BREATHING_SPACE_EXIT_URL, DASHBOARD_URL, LIFT_BREATHING_SPACE_URL} from '../../urls';
import {getHelpSupportLinks, getHelpSupportTitle} from 'services/dashboard/dashboardService';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {t} from 'i18next';

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

liftBreathingSpaceExitController.get(LIFT_BREATHING_SPACE_EXIT_URL, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const claimId = req.params.id as string;
    const lang = req.query.lang ? req.query.lang : req.cookies.lang;
    const helpSupportTitle = getHelpSupportTitle(lang);
    const helpSupportLinks = getHelpSupportLinks(lang);
    const backLinkUrl = constructResponseUrlWithIdParams(claimId, LIFT_BREATHING_SPACE_URL);
    const returnUrl = typeof req.query.returnUrl === 'string' && req.query.returnUrl.startsWith('/')
      ? req.query.returnUrl
      : constructResponseUrlWithIdParams(claimId, LIFT_BREATHING_SPACE_URL);
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
    const safeReturnUrl = typeof returnUrl === 'string' && returnUrl.startsWith('/')
      ? returnUrl
      : constructResponseUrlWithIdParams(claimId, LIFT_BREATHING_SPACE_URL);
    if (!option) {
      const helpSupportTitle = getHelpSupportTitle(lang);
      const helpSupportLinks = getHelpSupportLinks(lang);
      const backLinkUrl = constructResponseUrlWithIdParams(claimId, LIFT_BREATHING_SPACE_URL);
      const errorMessage = t('PAGES.BREATHING_SPACE.LIFT.EXIT.OPTION_REQUIRED', {lng: lang as string});
      const errors = {
        errorSummaryList: [{text: errorMessage, href: '#option'}],
        optionError: {text: errorMessage},
      };
      renderExitPage(res, claimId, helpSupportTitle, helpSupportLinks, backLinkUrl, safeReturnUrl, errors);
      return;
    }
    if (option === 'yes') {
      res.redirect(constructResponseUrlWithIdParams(claimId, DASHBOARD_URL));
    } else {
      res.redirect(safeReturnUrl);
    }
  } catch (error) {
    next(error);
  }
});

export default liftBreathingSpaceExitController;
