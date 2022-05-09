import * as express from 'express';
import {CITIZEN_TIMELINE_URL} from '../../../urls';
import {GenericForm} from '../../../../common/form//models/genericForm';
import {DefendantTimeline} from '../../../../common/form//models/timeLineOfEvents/defendantTimeline';

const defendantTimelineController = express.Router();
const defendantTimelineView = 'features/response/timelineOfEvents/defendant-timeline';

function renderView(form: GenericForm<DefendantTimeline>, res: express.Response) {
  res.render(defendantTimelineView, {form: form});
}

defendantTimelineController.get(CITIZEN_TIMELINE_URL, (req, res) => {
  const form = new GenericForm(DefendantTimeline.buildEmptyForm());
  renderView(form, res);
});

export default defendantTimelineController;
