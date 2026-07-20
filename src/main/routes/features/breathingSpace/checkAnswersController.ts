import {NextFunction, Request, Response, Router} from 'express';
import {CYA_LIFT_BREATHING_SPACE_URL, DASHBOARD_URL, LIFT_BREATHING_SPACE_URL, LIFT_BREATHING_SPACE_EXIT_URL} from '../../urls';
import {getSummaryRows} from 'services/features/breathingSpace/checkAnswersService';
import {getHelpSupportLinks, getHelpSupportTitle} from 'services/dashboard/dashboardService';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {getClaimById} from 'modules/utilityService';

const checkAnswersController = Router();
const checkAnswersViewPath = 'features/breathingSpace/check-answers';

checkAnswersController.get(CYA_LIFT_BREATHING_SPACE_URL, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const claimId = req.params.id as string;
    const lang = req.query.lang ? req.query.lang : req.cookies.lang;
    const claim = await getClaimById(claimId, req);
    const summaryRows = getSummaryRows(claimId, claim, lang);
    const helpSupportTitle = getHelpSupportTitle(lang);
    const helpSupportLinks = getHelpSupportLinks(lang);
    const backUrl = constructResponseUrlWithIdParams(claimId, DASHBOARD_URL);
    const liftBreathingSpaceUrl = constructResponseUrlWithIdParams(claimId, LIFT_BREATHING_SPACE_URL);

    res.render(checkAnswersViewPath, {
      summaryRows,
      claimId,
      helpSupportTitle,
      helpSupportLinks,
      backUrl,
      backLinkUrl: liftBreathingSpaceUrl,
      liftBreathingSpaceUrl,
    });
  } catch (error) {
    next(error);
  }
});

checkAnswersController.post(CYA_LIFT_BREATHING_SPACE_URL, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const claimId = req.params.id as string;
    res.redirect(constructResponseUrlWithIdParams(claimId, LIFT_BREATHING_SPACE_EXIT_URL));
  } catch (error) {
    next(error);
  }
});

export default checkAnswersController;
