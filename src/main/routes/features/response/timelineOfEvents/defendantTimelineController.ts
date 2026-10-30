import {NextFunction, RequestHandler, Response, Router} from 'express';
import {
  CITIZEN_EVIDENCE_URL,
  CITIZEN_TIMELINE_URL,
  CASE_TIMELINE_DOCUMENTS_URL,
} from 'routes/urls';
import {GenericForm} from 'form/models/genericForm';
import {DefendantTimeline} from 'form/models/timeLineOfEvents/defendantTimeline';
import {
  getDefendantTimeline,
  saveDefendantTimeline,
} from 'services/features/response/timelineOfEvents/defendantTimelineService';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {getResponseClaimById} from 'modules/draft-store/response/responseDraftStoreService';
import {TimeLineOfEvents} from 'models/timelineOfEvents/timeLineOfEvents';
import {AppRequest} from 'common/models/AppRequest';
import {getRouteParam} from 'common/utils/routeParamUtils';

const defendantTimelineController = Router();
const defendantTimelineView = 'features/response/timelineOfEvents/defendant-timeline';

function renderView(form: GenericForm<DefendantTimeline>, theirTimeline: TimeLineOfEvents[], pdfUrl: string, res: Response) {
  res.render(defendantTimelineView, {
    form, theirTimeline, pdfUrl,
  });
}

defendantTimelineController.get(CITIZEN_TIMELINE_URL,
  (async (req, res, next: NextFunction) => {
    try {
      const caseId = getRouteParam(req, 'id');
      const claim = await getResponseClaimById(<AppRequest>req, caseId);
      const theirTimeline = claim.timelineOfEvents;
      const pdfUrl = claim.extractDocumentId() && CASE_TIMELINE_DOCUMENTS_URL.replace(':id', caseId).replace(':documentId', claim.extractDocumentId());
      const form = new GenericForm(getDefendantTimeline(claim));
      renderView(form, theirTimeline, pdfUrl, res);
    } catch (error) {
      next(error);
    }
  }) as RequestHandler);

defendantTimelineController.post(CITIZEN_TIMELINE_URL, (async (req, res, next: NextFunction) => {
  try {
    const caseId = getRouteParam(req, 'id');
    const appReq = <AppRequest>req;
    const form = new GenericForm(DefendantTimeline.buildPopulatedForm(req.body.rows, req.body.comment));
    await form.validate();

    if (form.hasErrors()) {
      const claim = await getResponseClaimById(appReq, caseId);
      const pdfUrl = claim.extractDocumentId() && CASE_TIMELINE_DOCUMENTS_URL.replace(':id', caseId).replace(':documentId', claim.extractDocumentId());
      renderView(form, claim.timelineOfEvents, pdfUrl, res);
    } else {
      await saveDefendantTimeline(appReq, form.model);
      res.redirect(constructResponseUrlWithIdParams(caseId, CITIZEN_EVIDENCE_URL));
    }
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

export default defendantTimelineController;
