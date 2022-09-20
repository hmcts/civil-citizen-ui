import * as express from 'express';
import {DQ_SENT_EXPERT_REPORTS_URL, DQ_SHARE_AN_EXPERT_URL} from '../../urls';
import {GenericForm} from '../../../common/form/models/genericForm';
import {ExpertReports} from '../../../common/models/directionsQuestionnaire/expertReports';
import {
  getExpertReports,
  getExpertReportsForm,
  saveExpertReports,
} from '../../../services/features/directionsQuestionnaire/expertReportsService';
import {constructResponseUrlWithIdParams} from '../../../common/utils/urlFormatter';

const expertReportsController = express.Router();
const expertReportsViewPath = 'features/directionsQuestionnaire/expert-reports';

function renderView(form: GenericForm<ExpertReports>, res: express.Response): void {
  res.render(expertReportsViewPath, {form});
}

expertReportsController.get(DQ_SENT_EXPERT_REPORTS_URL, async (req, res, next) => {
  try {
    renderView(new GenericForm(await getExpertReports(req.params.id)), res);
  } catch (error) {
    next(error);
  }
});

expertReportsController.post(DQ_SENT_EXPERT_REPORTS_URL, async (req, res, next) => {
  try {
    const claimId = req.params.id;
    const expertReports = getExpertReportsForm(req.body.expertReportsOptions);
    const form = new GenericForm(expertReports);
    form.validateSync();

    if (form.hasErrors()) {
      renderView(form, res);
    } else {
      await saveExpertReports(claimId, expertReports);
      res.redirect(constructResponseUrlWithIdParams(claimId, DQ_SHARE_AN_EXPERT_URL));
    }
  } catch (error) {
    next(error);
  }
});

export default expertReportsController;
