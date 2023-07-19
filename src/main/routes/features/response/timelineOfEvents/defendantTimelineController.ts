import {NextFunction, Response, Router} from 'express';
import {
  CITIZEN_EVIDENCE_URL,
  CITIZEN_TIMELINE_URL,
  CASE_TIMELINE_DOCUMENTS_URL,
} from '../../../urls';
import {GenericForm} from '../../../../common/form//models/genericForm';
import {DefendantTimeline} from '../../../../common/form//models/timeLineOfEvents/defendantTimeline';
import {
  getPartialAdmitTimeline,
  savePartialAdmitTimeline,
} from '../../../../services/features/response/timelineOfEvents/defendantTimelineService';
import {constructResponseUrlWithIdParams} from '../../../../common/utils/urlFormatter';
import {getCaseDataFromStore} from '../../../../modules/draft-store/draftStoreService';
import {TimeLineOfEvents} from '../../../../common/models/timelineOfEvents/timeLineOfEvents';

const defendantTimelineController = Router();
const defendantTimelineView = 'features/response/timelineOfEvents/defendant-timeline';

function renderView(form: GenericForm<DefendantTimeline>, theirTimeline: TimeLineOfEvents[], pdfUrl: string, res: Response) {
  res.render(defendantTimelineView, {
    form, theirTimeline, pdfUrl,
  });
}

defendantTimelineController.get(CITIZEN_TIMELINE_URL,
  async (req, res, next: NextFunction) => {
    try {
      const claim = await getCaseDataFromStore(req.params.id);
      const theirTimeline = claim.timelineOfEvents;
      const pdfUrl = claim.extractDocumentId() && CASE_TIMELINE_DOCUMENTS_URL.replace(':id', req.params.id).replace(':documentId', claim.extractDocumentId());
      const form = new GenericForm(getPartialAdmitTimeline(claim));
      renderView(form, theirTimeline, pdfUrl, res);
    } catch (error) {
      next(error);
    }
  });

defendantTimelineController.post(CITIZEN_TIMELINE_URL, async (req, res, next: NextFunction) => {
  try {
    const form = new GenericForm(DefendantTimeline.buildPopulatedForm(req.body.rows, req.body.comment));
    await form.validate();
    if (form.hasErrors()) {
      const claim = await getCaseDataFromStore(req.params.id);
      const pdfUrl = claim.extractDocumentId() && CASE_TIMELINE_DOCUMENTS_URL.replace(':id', req.params.id);
      renderView(form, claim.timelineOfEvents, pdfUrl, res);
    } else {
      await savePartialAdmitTimeline(req.params.id, form.model);
      res.redirect(constructResponseUrlWithIdParams(req.params.id, CITIZEN_EVIDENCE_URL));
    }
  } catch (error) {
    next(error);
  }
});

export default defendantTimelineController;
