import {NextFunction, Request, Response, Router} from 'express';
import {BREATHING_SPACE_LIFT_URL, CYA_LIFT_BREATHING_SPACE_URL, DASHBOARD_URL, LIFT_BREATHING_SPACE_EXIT_URL, LIFT_BREATHING_SPACE_CONFIRMATION_URL} from '../../urls';
import {getSummaryRows} from 'services/features/breathingSpace/checkAnswersService';
import {getHelpSupportLinks, getHelpSupportTitle} from 'services/dashboard/dashboardService';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {getClaimById} from 'modules/utilityService';
import {translateDraftLiftBreathingSpaceToCCD} from 'services/translation/breathingSpace/convertToCCDLiftBreathingSpace';
import config from 'config';
import {CivilServiceClient} from 'client/civilServiceClient';
import {AppRequest} from 'models/AppRequest';

const checkAnswersController = Router();
const checkAnswersViewPath = 'features/breathingSpace/check-answers';
const civilServiceApiBaseUrl = config.get<string>('services.civilService.url');
const civilServiceClient: CivilServiceClient = new CivilServiceClient(civilServiceApiBaseUrl);

checkAnswersController.get(CYA_LIFT_BREATHING_SPACE_URL, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const claimId = req.params.id as string;
    const lang = req.query.lang ? req.query.lang : req.cookies.lang;
    const claim = await getClaimById(claimId, req, true);
    const summaryRows = getSummaryRows(claimId, claim, lang);
    const helpSupportTitle = getHelpSupportTitle(lang);
    const helpSupportLinks = getHelpSupportLinks(lang);
    const backUrl = constructResponseUrlWithIdParams(claimId, DASHBOARD_URL);
    const liftBreathingSpaceUrl = constructResponseUrlWithIdParams(claimId, BREATHING_SPACE_LIFT_URL);
    const cyaUrl = constructResponseUrlWithIdParams(claimId, CYA_LIFT_BREATHING_SPACE_URL);
    const exitUrl = constructResponseUrlWithIdParams(claimId, LIFT_BREATHING_SPACE_EXIT_URL) + '?returnUrl=' + encodeURIComponent(cyaUrl);

    res.render(checkAnswersViewPath, {
      summaryRows,
      claimId,
      helpSupportTitle,
      helpSupportLinks,
      backUrl,
      backLinkUrl: liftBreathingSpaceUrl,
      liftBreathingSpaceUrl,
      exitUrl,
    });
  } catch (error) {
    next(error);
  }
});

checkAnswersController.post(CYA_LIFT_BREATHING_SPACE_URL, async (req: AppRequest, res: Response, next: NextFunction) => {
  try {
    const claimId = req.params.id as string;
    const claim = await getClaimById(claimId, req, true);
    const liftBreathingCCD = translateDraftLiftBreathingSpaceToCCD(claim);
    await civilServiceClient.submitLiftBreathingSpace(claimId, liftBreathingCCD, req);
    res.redirect(constructResponseUrlWithIdParams(claimId, LIFT_BREATHING_SPACE_CONFIRMATION_URL));
  } catch (error) {
    next(error);
  }
});

export default checkAnswersController;
