import {NextFunction, RequestHandler, Response, Router} from 'express';
import {
  BREATHING_SPACE_CANCEL_URL,
  BREATHING_SPACE_CONFIRMATION_URL,
  BREATHING_SPACE_CYA_URL,
  BREATHING_SPACE_START_DATE_URL,
  DASHBOARD_CLAIMANT_URL,
} from '../../urls';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {getClaimById} from 'modules/utilityService';
import {getRouteParam} from 'common/utils/routeParamUtils';
import {AppRequest} from 'models/AppRequest';
import {
  cancelBreathingSpaceEntry,
  getBreathingSpaceCheckAnswersRows,
} from 'services/features/dashboard/breathingSpaceEntryService';
import {
  translateDraftBreathingSpaceEnterToCCD,
} from 'services/translation/breathingSpace/convertToCCDEnterBreathingSpace';
import config from 'config';
import {CivilServiceClient} from 'client/civilServiceClient';

const breathingSpaceCheckAnswersViewPath = 'features/dashboard/breathing-space-check-answers';
const breathingSpaceCheckAnswersController = Router();
const civilServiceApiBaseUrl = config.get<string>('services.civilService.url');
const civilServiceClient: CivilServiceClient = new CivilServiceClient(civilServiceApiBaseUrl);

async function renderView(req: AppRequest, res: Response, claimId: string) {
  const claim = await getClaimById(claimId, req, true);
  const lang = req.query.lang ? String(req.query.lang) : req.cookies.lang;
  const startDateUrl = constructResponseUrlWithIdParams(claimId, BREATHING_SPACE_START_DATE_URL);
  res.render(breathingSpaceCheckAnswersViewPath, {
    pageTitle: 'PAGES.BREATHING_SPACE_ENTRY.PAGE_TITLE',
    backLinkUrl: startDateUrl,
    cancelUrl: constructResponseUrlWithIdParams(claimId, BREATHING_SPACE_CANCEL_URL),
    dashboardUrl: constructResponseUrlWithIdParams(claimId, DASHBOARD_CLAIMANT_URL),
    summaryRows: getBreathingSpaceCheckAnswersRows(claimId, claim, lang),
  });
}

breathingSpaceCheckAnswersController.get(BREATHING_SPACE_CYA_URL, (async (req: AppRequest, res: Response, next: NextFunction) => {
  try {
    const claimId = getRouteParam(req, 'id');
    await renderView(req, res, claimId);
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

breathingSpaceCheckAnswersController.post(BREATHING_SPACE_CYA_URL, (async (req: AppRequest, res: Response, next: NextFunction) => {
  try {
    const claimId = getRouteParam(req, 'id');
    const claim = await getClaimById(claimId, req, true);
    const enterBreathingCCD = translateDraftBreathingSpaceEnterToCCD(claim);
    await civilServiceClient.submitEnterBreathingSpace(claimId, enterBreathingCCD, req);
    req.session.breathingSpaceAppliedType = claim.breathingSpaceEnterDraft?.type;
    req.session.breathingSpaceAppliedStart = claim.breathingSpaceEnterDraft?.start
      ? new Date(claim.breathingSpaceEnterDraft.start).toISOString()
      : undefined;
    await cancelBreathingSpaceEntry(req);
    res.redirect(constructResponseUrlWithIdParams(claimId, BREATHING_SPACE_CONFIRMATION_URL));
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

export default breathingSpaceCheckAnswersController;
