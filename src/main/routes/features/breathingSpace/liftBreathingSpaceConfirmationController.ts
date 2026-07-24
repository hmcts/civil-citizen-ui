import {NextFunction, RequestHandler, Response, Router} from 'express';
import {LIFT_BREATHING_SPACE_CONFIRMATION_URL, DASHBOARD_CLAIMANT_URL} from '../../urls';
import {t} from 'i18next';
import {AppRequest} from 'models/AppRequest';
import {getRouteParam} from 'common/utils/routeParamUtils';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {getHelpSupportLinks, getHelpSupportTitle} from 'services/dashboard/dashboardService';

const liftBreathingSpaceConfirmationViewPath = 'features/breathingSpace/lift-confirmation';
const liftBreathingSpaceConfirmationController = Router();

liftBreathingSpaceConfirmationController.get(LIFT_BREATHING_SPACE_CONFIRMATION_URL, (async (req: AppRequest, res: Response, next: NextFunction) => {
  try {
    const lng = req.query.lang ? req.query.lang : req.cookies.lang;
    const claimId = getRouteParam(req, 'id');
    const helpSupportTitle = getHelpSupportTitle(lng);
    const helpSupportLinks = getHelpSupportLinks(lng);
    res.render(liftBreathingSpaceConfirmationViewPath, {
      confirmationTitle: t('PAGES.BREATHING_SPACE.LIFT.CONFIRMATION.TITLE', {lng}),
      caseSummaryUrl: constructResponseUrlWithIdParams(claimId, DASHBOARD_CLAIMANT_URL),
      claimId,
      helpSupportTitle,
      helpSupportLinks,
    });
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

export default liftBreathingSpaceConfirmationController;
