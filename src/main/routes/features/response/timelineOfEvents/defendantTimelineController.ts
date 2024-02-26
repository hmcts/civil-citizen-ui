import {NextFunction, RequestHandler, Response, Router} from 'express';
import {
  CITIZEN_EVIDENCE_URL,
  CITIZEN_TIMELINE_URL,
  CASE_TIMELINE_DOCUMENTS_URL,
} from 'routes/urls';
import {GenericForm} from 'form/models/genericForm';
import {DefendantTimeline} from 'form/models/timeLineOfEvents/defendantTimeline';
import {
  getPartialAdmitTimeline,
  savePartialAdmitTimeline,
} from 'services/features/response/timelineOfEvents/defendantTimelineService';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {generateRedisKey, getCaseDataFromStore} from 'modules/draft-store/draftStoreService';
import {TimeLineOfEvents} from 'models/timelineOfEvents/timeLineOfEvents';
import {AppRequest} from 'common/models/AppRequest';

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
      const claim = await getCaseDataFromStore(generateRedisKey(<AppRequest>req));
      const theirTimeline = claim.timelineOfEvents;
      const pdfUrl = claim.extractDocumentId() && CASE_TIMELINE_DOCUMENTS_URL.replace(':id', req.params.id).replace(':documentId', claim.extractDocumentId());
      const form = new GenericForm(getPartialAdmitTimeline(claim));
      renderView(form, theirTimeline, pdfUrl, res);
    } catch (error) {
      next(error);
    }
  }) as RequestHandler);

defendantTimelineController.post(CITIZEN_TIMELINE_URL, (async (req, res, next: NextFunction) => {
  try {
    const form = new GenericForm(DefendantTimeline.buildPopulatedForm(req.body.rows, req.body.comment));
    const redisKey = generateRedisKey(<AppRequest>req);
    await form.validate();
    if (form.hasErrors()) {
      const claim = await getCaseDataFromStore(redisKey);
      const pdfUrl = claim.extractDocumentId() && CASE_TIMELINE_DOCUMENTS_URL.replace(':id', req.params.id).replace(':documentId', claim.extractDocumentId());
      renderView(form, claim.timelineOfEvents, pdfUrl, res);
    } else {
      await savePartialAdmitTimeline(redisKey, form.model);
      res.redirect(constructResponseUrlWithIdParams(req.params.id, CITIZEN_EVIDENCE_URL));
    }
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

export default defendantTimelineController;
