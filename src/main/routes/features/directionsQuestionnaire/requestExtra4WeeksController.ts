import * as express from 'express';
import {DQ_REQUEST_EXTRA_4WEEKS_URL, DQ_CONSIDER_CLAIMANT_DOCUMENTS} from '../../urls';
import {GenericForm} from '../../../common/form/models/genericForm';
import {RequestExtra4weeks} from 'common/models/directionsQuestionnaire/requestExtra4Weeks';
import {
  getRequestExtra4weeks,
  getRequestExtra4weeksForm,
  saveRequestExtra4weeks,
} from '../../../services/features/directionsQuestionnaire/requestExtra4WeeksService';
import {constructResponseUrlWithIdParams} from '../../../common/utils/urlFormatter';


const requestExtra4WeeksController = express.Router();

function renderView(form: GenericForm<RequestExtra4weeks>, res: express.Response): void {
  const requestExtra4WeeksClaimForm = Object.assign(form);
  requestExtra4WeeksClaimForm.option = form.model.option;
  res.render('features/directionsQuestionnaire/request-extra-4weeks', {form: requestExtra4WeeksClaimForm});
}

requestExtra4WeeksController.get(DQ_REQUEST_EXTRA_4WEEKS_URL, async (req, res, next) => {
  try {
    renderView(new GenericForm(await getRequestExtra4weeks(req.params.id)), res);
  } catch (error) {
    next(error);
  }
});

requestExtra4WeeksController.post(DQ_REQUEST_EXTRA_4WEEKS_URL, async (req, res, next) => {
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

export default requestExtra4WeeksController;
