import * as express from 'express';
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

const defendantTimelineController = express.Router();
const defendantTimelineView = 'features/response/timelineOfEvents/defendant-timeline';

function renderView(form: GenericForm<DefendantTimeline>, theirTimeline: TimeLineOfEvents[], pdfUrl: string, res: express.Response) {
  res.render(defendantTimelineView, {
    form: form, theirTimeline: theirTimeline, pdfUrl,
  });
}

defendantTimelineController.get(CITIZEN_TIMELINE_URL,
  async (req, res) => {
    try {
      const claim = await getCaseDataFromStore(req.params.id);
      const theirTimeline = claim.timelineOfEvents;
      const pdfUrl = CASE_TIMELINE_DOCUMENTS_URL.replace(':id', req.params.id);
      const form = new GenericForm(getPartialAdmitTimeline(claim));
      renderView(form, theirTimeline, pdfUrl, res);
    } catch (error) {
      res.status(500).send({error: error.message});
    }
  });

defendantTimelineController.post(CITIZEN_TIMELINE_URL, async (req, res) => {
  try {
    const form = new GenericForm(DefendantTimeline.buildPopulatedForm(req.body.rows, req.body.comment));
    await form.validate();
    if (form.hasErrors()) {
      const claim = await getCaseDataFromStore(req.params.id);
      const pdfUrl = CASE_TIMELINE_DOCUMENTS_URL.replace(':id', req.params.id);
      renderView(form, claim.timelineOfEvents, pdfUrl, res);
    } else {
      await savePartialAdmitTimeline(req.params.id, form.model);
      res.redirect(constructResponseUrlWithIdParams(req.params.id, CITIZEN_EVIDENCE_URL));
    }
  } catch (error) {
    res.status(500).send({error: error.message});
  }
});

export default defendantTimelineController;
