import * as express from 'express';
import {CITIZEN_TIMELINE_URL} from '../../../urls';
import {GenericForm} from '../../../../common/form//models/genericForm';
import {DefendantTimeline} from '../../../../common/form//models/timeLineOfEvents/defendantTimeline';

const defendantTimelineController = express.Router();
const defendantTimelineView = 'features/response/timelineOfEvents/defendant-timeline';
const {Logger} = require('@hmcts/nodejs-logging');

const logger = Logger.getLogger('defendantTimelineController');

function renderView(form: GenericForm<DefendantTimeline>, res: express.Response) {
  res.render(defendantTimelineView, {form: form});
}

defendantTimelineController.get(CITIZEN_TIMELINE_URL, (req, res) => {
  const form = new GenericForm(DefendantTimeline.buildEmptyForm());
  renderView(form, res);
});

defendantTimelineController.post(CITIZEN_TIMELINE_URL, async (req, res) => {
  try {
    const form = new GenericForm(DefendantTimeline.buildPopulatedForm(req.body.rows, req.body.comment));
    await form.validate();
    if (form.hasErrors()) {
      renderView(form, res);
    }
  } catch (error) {
    logger.error(error);
    res.status(500).send({error: error.message});
  }
});

export default defendantTimelineController;
