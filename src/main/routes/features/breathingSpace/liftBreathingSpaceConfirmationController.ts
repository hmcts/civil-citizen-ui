import {NextFunction, RequestHandler, Response, Router} from 'express';
import {LIFT_BREATHING_SPACE_CONFIRMATION_URL, DASHBOARD_CLAIMANT_URL} from '../../urls';
import {t} from 'i18next';
import {AppRequest} from 'models/AppRequest';
import {getRouteParam} from 'common/utils/routeParamUtils';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {getHelpSupportLinks, getHelpSupportTitle} from 'services/dashboard/dashboardService';
import {getClaimById} from 'modules/utilityService';
import {BreathingSpaceType} from 'models/breathingSpace/breathingSpaceType';
import {caseNumberPrettify} from 'common/utils/stringUtils';
import {formatDateToFullDate, isDateAfterToday} from 'common/utils/dateUtils';
import {getLiftExpectedEnd} from 'services/features/breathingSpace/liftBreathingSpaceService';

const liftBreathingSpaceConfirmationViewPath = 'features/breathingSpace/lift-confirmation';
const liftBreathingSpaceConfirmationController = Router();

liftBreathingSpaceConfirmationController.get(LIFT_BREATHING_SPACE_CONFIRMATION_URL, (async (req: AppRequest, res: Response, next: NextFunction) => {
  try {
    const lang = req.query.lang ? req.query.lang : req.cookies.lang;
    const lng = typeof lang === 'string' ? lang : undefined;
    const claimId = getRouteParam(req, 'id');
    const claim = await getClaimById(claimId, req, true);
    const claimNumber = caseNumberPrettify(claim.legacyCaseReference || claimId);
    const breathingSpaceType = claim.enterBreathing?.type ?? claim.breathingSpace?.enterBreathing?.type;
    const expectedEnd = getLiftExpectedEnd(claim);
    const futureDatedExit = isDateAfterToday(expectedEnd);
    const confirmationPageTitle = breathingSpaceType === BreathingSpaceType.MENTAL_HEALTH
      ? 'PAGES.BREATHING_SPACE.LIFT.CONFIRMATION.MENTAL_HEALTH_PAGE_TITLE'
      : breathingSpaceType === BreathingSpaceType.STANDARD
        ? 'PAGES.BREATHING_SPACE.LIFT.CONFIRMATION.STANDARD_PAGE_TITLE'
        : 'PAGES.BREATHING_SPACE.LIFT.CONFIRMATION.PAGE_TITLE';
    const futurePanelTitleKey = breathingSpaceType === BreathingSpaceType.MENTAL_HEALTH
      ? 'PAGES.BREATHING_SPACE.LIFT.CONFIRMATION.MENTAL_HEALTH_WILL_LIFT_ON'
      : 'PAGES.BREATHING_SPACE.LIFT.CONFIRMATION.STANDARD_WILL_LIFT_ON';
    const confirmationTitle = futureDatedExit && expectedEnd
      ? t(futurePanelTitleKey, {lng, date: formatDateToFullDate(new Date(expectedEnd), lng)})
      : t(confirmationPageTitle, {lng});
    const confirmationEmailKey = futureDatedExit
      ? 'PAGES.BREATHING_SPACE.LIFT.CONFIRMATION.EMAIL_WHEN_ENDED'
      : 'PAGES.BREATHING_SPACE.LIFT.CONFIRMATION.EMAIL_SENT';
    const helpSupportTitle = getHelpSupportTitle(lng);
    const helpSupportLinks = getHelpSupportLinks(lng);
    res.render(liftBreathingSpaceConfirmationViewPath, {
      confirmationTitle,
      confirmationPageTitle,
      confirmationEmailKey,
      caseSummaryUrl: constructResponseUrlWithIdParams(claimId, DASHBOARD_CLAIMANT_URL),
      claimNumber,
      helpSupportTitle,
      helpSupportLinks,
    });
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

export default liftBreathingSpaceConfirmationController;
