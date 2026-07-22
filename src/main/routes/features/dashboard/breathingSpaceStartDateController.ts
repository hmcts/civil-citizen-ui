import {NextFunction, RequestHandler, Response, Router} from 'express';
import {
  BREATHING_SPACE_CANCEL_URL,
  BREATHING_SPACE_CYA_URL,
  BREATHING_SPACE_ENTER_URL,
  BREATHING_SPACE_START_DATE_URL,
  DASHBOARD_CLAIMANT_URL,
} from '../../urls';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {getClaimById} from 'modules/utilityService';
import {getRouteParam} from 'common/utils/routeParamUtils';
import {GenericForm} from 'form/models/genericForm';
import {BreathingSpaceStartDate} from 'models/breathingSpace/breathingSpaceStartDate';
import {BreathingSpaceType} from 'models/breathingSpace/breathingSpaceType';
import {AppRequest} from 'models/AppRequest';
import {
  getBreathingSpaceStartDateForm,
  resolveBreathingSpaceStartDate,
  saveBreathingSpaceStartDate,
} from 'services/features/dashboard/breathingSpaceEntryService';

const breathingSpaceStartDateViewPath = 'features/dashboard/breathing-space-start-date';
const breathingSpaceStartDateController = Router();

async function renderView(
  res: Response,
  claimId: string,
  form: GenericForm<BreathingSpaceStartDate>,
  isMentalHealth: boolean,
) {
  res.render(breathingSpaceStartDateViewPath, {
    form,
    pageTitle: 'PAGES.BREATHING_SPACE_ENTRY.PAGE_TITLE',
    backLinkUrl: constructResponseUrlWithIdParams(claimId, BREATHING_SPACE_ENTER_URL),
    cancelUrl: constructResponseUrlWithIdParams(claimId, BREATHING_SPACE_CANCEL_URL),
    dashboardUrl: constructResponseUrlWithIdParams(claimId, DASHBOARD_CLAIMANT_URL),
    isMentalHealth,
    today: new Date(),
  });
}

breathingSpaceStartDateController.get(BREATHING_SPACE_START_DATE_URL, (async (req: AppRequest, res: Response, next: NextFunction) => {
  try {
    const claimId = getRouteParam(req, 'id');
    const claim = await getClaimById(claimId, req, true);
    req.session.previousUrl = req.originalUrl;
    const type = claim.breathingSpaceEnterDraft?.type;
    const form = new GenericForm(getBreathingSpaceStartDateForm(claim));
    await renderView(res, claimId, form, type === BreathingSpaceType.MENTAL_HEALTH);
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

breathingSpaceStartDateController.post(BREATHING_SPACE_START_DATE_URL, (async (req: AppRequest, res: Response, next: NextFunction) => {
  try {
    const claimId = getRouteParam(req, 'id');
    const claim = await getClaimById(claimId, req, true);
    const type = claim.breathingSpaceEnterDraft?.type;
    const form = new GenericForm(new BreathingSpaceStartDate(req.body.day, req.body.month, req.body.year));
    await form.validate();
    if (form.hasErrors()) {
      await renderView(res, claimId, form, type === BreathingSpaceType.MENTAL_HEALTH);
      return;
    }
    const start = resolveBreathingSpaceStartDate(form.model);
    await saveBreathingSpaceStartDate(req, start);
    const savedForm = new GenericForm(new BreathingSpaceStartDate(
      String(start.getDate()),
      String(start.getMonth() + 1),
      String(start.getFullYear()),
    ));
    await renderView(res, claimId, savedForm, type === BreathingSpaceType.MENTAL_HEALTH);
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

export default breathingSpaceStartDateController;
