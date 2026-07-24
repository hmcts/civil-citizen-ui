import {NextFunction, RequestHandler, Response, Router} from 'express';
import {
  BREATHING_SPACE_CANCEL_URL,
  BREATHING_SPACE_ENTER_URL,
  BREATHING_SPACE_INFO_URL,
  BREATHING_SPACE_START_DATE_URL,
  DASHBOARD_CLAIMANT_URL,
} from '../../urls';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {getClaimById} from 'modules/utilityService';
import {getRouteParam} from 'common/utils/routeParamUtils';
import {GenericForm} from 'form/models/genericForm';
import {BreathingSpaceEnterDraft} from 'models/breathingSpace/breathingSpaceEnterDraft';
import {BreathingSpaceType} from 'models/breathingSpace/breathingSpaceType';
import {
  getBreathingSpaceEnterDraftForm,
  saveBreathingSpaceEnterDraft,
} from 'services/features/dashboard/breathingSpaceEntryService';
import {AppRequest} from 'models/AppRequest';

const breathingSpaceEnterViewPath = 'features/dashboard/breathing-space-enter';
const breathingSpaceEntryController = Router();

async function renderView(res: Response, claimId: string, form: GenericForm<BreathingSpaceEnterDraft>) {
  res.render(breathingSpaceEnterViewPath, {
    form,
    pageTitle: 'PAGES.BREATHING_SPACE_ENTRY.PAGE_TITLE',
    backLinkUrl: constructResponseUrlWithIdParams(claimId, BREATHING_SPACE_INFO_URL),
    cancelUrl: constructResponseUrlWithIdParams(claimId, BREATHING_SPACE_CANCEL_URL),
    dashboardUrl: constructResponseUrlWithIdParams(claimId, DASHBOARD_CLAIMANT_URL),
    BreathingSpaceType,
  });
}

breathingSpaceEntryController.get(BREATHING_SPACE_ENTER_URL, (async (req: AppRequest, res: Response, next: NextFunction) => {
  try {
    const claimId = getRouteParam(req, 'id');
    const claim = await getClaimById(claimId, req, true);
    req.session.previousUrl = req.originalUrl;
    const form = new GenericForm(getBreathingSpaceEnterDraftForm(claim));
    await renderView(res, claimId, form);
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

breathingSpaceEntryController.post(BREATHING_SPACE_ENTER_URL, (async (req: AppRequest, res: Response, next: NextFunction) => {
  try {
    const claimId = getRouteParam(req, 'id');
    await getClaimById(claimId, req, true);
    const form = new GenericForm(new BreathingSpaceEnterDraft(req.body.type, req.body.reference));
    await form.validate();
    if (form.hasErrors()) {
      await renderView(res, claimId, form);
      return;
    }
    await saveBreathingSpaceEnterDraft(req, form.model);
    res.redirect(constructResponseUrlWithIdParams(claimId, BREATHING_SPACE_START_DATE_URL));
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

export default breathingSpaceEntryController;
