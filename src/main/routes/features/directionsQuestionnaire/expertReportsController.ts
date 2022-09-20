import * as express from 'express';
import {DQ_EXPERT_REPORTS_URL, DQ_CONSIDER_CLAIMANT_DOCUMENTS} from '../../urls';
import {GenericForm} from '../../../common/form/models/genericForm';
import {GenericYesNo} from '../../../common/form/models/genericYesNo';
import {
  getRequestExtra4weeks,
  getRequestExtra4weeksForm,
  saveRequestExtra4weeks,
} from '../../../services/features/directionsQuestionnaire/requestExtra4WeeksService';
import {constructResponseUrlWithIdParams} from '../../../common/utils/urlFormatter';

const expertReportsController = express.Router();

function renderView(form: GenericForm<GenericYesNo>, res: express.Response): void {
  const requestExtra4WeeksClaimForm = Object.assign(form);
  requestExtra4WeeksClaimForm.option = form.model.option;
  res.render('features/directionsQuestionnaire/expert-reports', {form: requestExtra4WeeksClaimForm});
}

expertReportsController.get(DQ_EXPERT_REPORTS_URL, async (req, res, next) => {
  try {
    renderView(new GenericForm(await getRequestExtra4weeks(req.params.id)), res);
  } catch (error) {
    next(error);
  }
});

expertReportsController.post(DQ_EXPERT_REPORTS_URL, async (req, res, next) => {
  try {
    const claimId = req.params.id;
    const requestExtra4Weeks = getRequestExtra4weeksForm(req.body.option);
    const form = new GenericForm(requestExtra4Weeks);
    form.validateSync();

    if (form.hasErrors()) {
      renderView(form, res);
    } else {
      await saveRequestExtra4weeks(claimId, requestExtra4Weeks);
      res.redirect(constructResponseUrlWithIdParams(claimId, DQ_CONSIDER_CLAIMANT_DOCUMENTS));
    }
  } catch (error) {
    next(error);
  }
});

export default expertReportsController;
