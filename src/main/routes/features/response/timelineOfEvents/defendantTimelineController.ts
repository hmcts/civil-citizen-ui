import * as express from 'express';
import {CITIZEN_EVIDENCE_URL, CITIZEN_TIMELINE_URL} from '../../../urls';
import {GenericForm} from '../../../../common/form//models/genericForm';
import {DefendantTimeline} from '../../../../common/form//models/timeLineOfEvents/defendantTimeline';
import {
  getPartialAdmitTimeline,
  savePartialAdmitTimeline,
} from '../../../../modules/timelineOfEvents/defendantTimelineService';
import {constructResponseUrlWithIdParams} from '../../../../common/utils/urlFormatter';
import {getCaseDataFromStore} from '../../../../modules/draft-store/draftStoreService';
import {TimeLineOfEvents} from '../../../../common/models/timelineOfEvents/timeLineOfEvents';

const defendantTimelineController = express.Router();
const defendantTimelineView = 'features/response/timelineOfEvents/defendant-timeline';


function renderView(form: GenericForm<DefendantTimeline>, theirTimeline: TimeLineOfEvents[], res: express.Response) {
  res.render(defendantTimelineView, {form: form, theirTimeline: theirTimeline});
}

defendantTimelineController.get(CITIZEN_TIMELINE_URL, async (req, res) => {
  try {
    const claim = await getCaseDataFromStore(req.params.id);
    res.locals.claim = claim;
    const theirTimeline = claim.timeLineOfEvents;
    const form = new GenericForm(getPartialAdmitTimeline(claim));
    renderView(form, theirTimeline, res);
  } catch (error) {
    res.status(500).send({error: error.message});
  }
});

defendantTimelineController.post(CITIZEN_TIMELINE_URL, async (req, res) => {
  try {
    const form = new GenericForm(DefendantTimeline.buildPopulatedForm(req.body.rows, req.body.comment));
    await form.validate();
    if (form.hasErrors()) {
      const claim = res.locals.claim;
      renderView(form, claim.timeLineOfEvents, res);
    } else {
      await savePartialAdmitTimeline(req.params.id, form.model);
      res.redirect(constructResponseUrlWithIdParams(req.params.id, CITIZEN_EVIDENCE_URL));
    }
  } catch (error) {
    res.status(500).send({error: error.message});
  }
});

export default defendantTimelineController;
