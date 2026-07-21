import {NextFunction, Request, Response, Router} from 'express';
import {LIFT_BREATHING_SPACE_EXIT_URL, LIFT_BREATHING_SPACE_CONFIRMATION_URL, DASHBOARD_URL, CYA_LIFT_BREATHING_SPACE_URL} from '../../urls';
import {getHelpSupportLinks, getHelpSupportTitle} from 'services/dashboard/dashboardService';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {t} from 'i18next';

const liftBreathingSpaceExitController = Router();
const liftBreathingSpaceExitViewPath = 'features/breathingSpace/lift-exit';

const renderExitPage = (res: Response, claimId: string, helpSupportTitle: string, helpSupportLinks: unknown[], backLinkUrl: string, errors?: object) => {
  res.render(liftBreathingSpaceExitViewPath, {
    claimId,
    helpSupportTitle,
    helpSupportLinks,
    backLinkUrl,
    errors,
  });
};

liftBreathingSpaceExitController.get(LIFT_BREATHING_SPACE_EXIT_URL, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const claimId = req.params.id as string;
    const lang = req.query.lang ? req.query.lang : req.cookies.lang;
    const helpSupportTitle = getHelpSupportTitle(lang);
    const helpSupportLinks = getHelpSupportLinks(lang);
    const backLinkUrl = constructResponseUrlWithIdParams(claimId, CYA_LIFT_BREATHING_SPACE_URL);
    renderExitPage(res, claimId, helpSupportTitle, helpSupportLinks, backLinkUrl);
  } catch (error) {
    next(error);
  }
});

liftBreathingSpaceExitController.post(LIFT_BREATHING_SPACE_EXIT_URL, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const claimId = req.params.id as string;
    const lang = req.query.lang ? req.query.lang : req.cookies.lang;
    const {option} = req.body;
    if (!option) {
      const helpSupportTitle = getHelpSupportTitle(lang);
      const helpSupportLinks = getHelpSupportLinks(lang);
      const backLinkUrl = constructResponseUrlWithIdParams(claimId, CYA_LIFT_BREATHING_SPACE_URL);
      const errorMessage = t('PAGES.BREATHING_SPACE.LIFT.EXIT.OPTION_REQUIRED', {lng: lang as string});
      const errors = {
        errorSummaryList: [{text: errorMessage, href: '#option'}],
        optionError: {text: errorMessage},
      };
      renderExitPage(res, claimId, helpSupportTitle, helpSupportLinks, backLinkUrl, errors);
      return;
    }
    if (option === 'yes') {
      res.redirect(constructResponseUrlWithIdParams(claimId, DASHBOARD_URL));
    } else {
      res.redirect(constructResponseUrlWithIdParams(claimId, LIFT_BREATHING_SPACE_CONFIRMATION_URL));
    }
  } catch (error) {
    next(error);
  }
});

export default liftBreathingSpaceExitController;
