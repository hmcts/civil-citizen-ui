import * as express from 'express';
import {DQ_SENT_EXPERT_REPORTS_URL, DQ_SHARE_AN_EXPERT_URL} from '../../urls';
import {GenericForm} from '../../../common/form/models/genericForm';
import {SentExpertReports} from 'models/directionsQuestionnaire/sentExpertReports';
import {
  getSentExpertReports,
  getSentExpertReportsForm,
  saveSentExpertReports,
} from '../../../services/features/directionsQuestionnaire/sentExpertReportsService';
import {constructResponseUrlWithIdParams} from '../../../common/utils/urlFormatter';

const sentExpertReportsController = express.Router();
const expertReportsViewPath = 'features/directionsQuestionnaire/sent-expert-reports';

function renderView(form: GenericForm<SentExpertReports>, res: express.Response): void {
  res.render(expertReportsViewPath, {form});
}

sentExpertReportsController.get(DQ_SENT_EXPERT_REPORTS_URL, async (req, res, next) => {
  try {
    renderView(new GenericForm(await getSentExpertReports(req.params.id)), res);
  } catch (error) {
    next(error);
  }
});

sentExpertReportsController.post(DQ_SENT_EXPERT_REPORTS_URL, async (req, res, next) => {
  try {
    const claimId = req.params.id;
    const expertReports = getSentExpertReportsForm(req.body.sentExpertReportsOptions);
    const form = new GenericForm(expertReports);
    form.validateSync();

    if (form.hasErrors()) {
      renderView(form, res);
    } else {
      await saveSentExpertReports(claimId, expertReports);
      res.redirect(constructResponseUrlWithIdParams(claimId, DQ_SHARE_AN_EXPERT_URL));
    }
  } catch (error) {
    next(error);
  }
});

export default sentExpertReportsController;
