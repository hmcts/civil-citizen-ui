import {NextFunction, Request, RequestHandler, Response, Router} from 'express';
import {
  BREATHING_SPACE_CANCEL_URL,
  BREATHING_SPACE_ENTER_URL,
  DASHBOARD_CLAIMANT_URL,
} from '../../urls';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {getClaimById} from 'modules/utilityService';
import {getRouteParam} from 'common/utils/routeParamUtils';
import {GenericForm} from 'form/models/genericForm';
import {CancelDocuments} from 'models/caseProgression/cancelDocuments';
import {YesNo} from 'form/models/yesNo';
import {AppRequest} from 'models/AppRequest';
import {cancelBreathingSpaceEntry} from 'services/features/dashboard/breathingSpaceEntryService';

const breathingSpaceCancelViewPath = 'features/dashboard/breathing-space-cancel';
const breathingSpaceCancelController = Router();

async function renderView(res: Response, claimId: string, form: GenericForm<CancelDocuments>) {
  res.render(breathingSpaceCancelViewPath, {
    form,
    pageTitle: 'PAGES.BREATHING_SPACE_ENTRY.PAGE_TITLE',
    dashboardUrl: constructResponseUrlWithIdParams(claimId, DASHBOARD_CLAIMANT_URL),
  });
}

breathingSpaceCancelController.get(BREATHING_SPACE_CANCEL_URL, (async (req: Request, res: Response, next: NextFunction) => {
  try {
    const claimId = getRouteParam(req, 'id');
    await getClaimById(claimId, req, true);
    const form = new GenericForm(new CancelDocuments());
    await renderView(res, claimId, form);
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

breathingSpaceCancelController.post(BREATHING_SPACE_CANCEL_URL, (async (req: AppRequest, res: Response, next: NextFunction) => {
  try {
    const claimId = getRouteParam(req, 'id');
    await getClaimById(claimId, req, true);
    const form = new GenericForm(new CancelDocuments(req.body.option));
    await form.validate();
    if (form.hasErrors()) {
      await renderView(res, claimId, form);
      return;
    }
    if (form.model.option === YesNo.NO) {
      const previousUrl = req.session.previousUrl
        || constructResponseUrlWithIdParams(claimId, BREATHING_SPACE_ENTER_URL);
      res.redirect(previousUrl);
      return;
    }
    await cancelBreathingSpaceEntry(req);
    req.session.previousUrl = undefined;
    res.redirect(constructResponseUrlWithIdParams(claimId, DASHBOARD_CLAIMANT_URL));
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

export default breathingSpaceCancelController;
