import * as express from 'express';
import {DQ_REQUEST_EXTRA_4WEEKS_URL, DQ_CONSIDER_CLAIMANT_DOCUMENTS} from '../../urls';
import {GenericForm} from '../../../common/form/models/genericForm';
import {TriedToSettle} from '../../../common/models/directionsQuestionnaire/triedToSettle';
import {
  getRequestExtra4weeks,
  getRequestExtra4weeksForm,
  saveRequestExtra4weeks,
} from '../../../services/features/directionsQuestionnaire/requestExtra4WeeksService';
import {constructResponseUrlWithIdParams} from '../../../common/utils/urlFormatter';

const requestExtra4WeeksController = express.Router();

function renderView(form: GenericForm<TriedToSettle>, res: express.Response): void {
  const triedToSettleClaimForm = Object.assign(form);
  triedToSettleClaimForm.option = form.model.option;
  res.render('features/directionsQuestionnaire/request-extra-4weeks', {form: triedToSettleClaimForm});
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
    const triedToSettle = getRequestExtra4weeksForm(req.body.option);
    const form = new GenericForm(triedToSettle);
    form.validateSync();

    if (form.hasErrors()) {
      renderView(form, res);
    } else {
      await saveRequestExtra4weeks(claimId, triedToSettle);
      res.redirect(constructResponseUrlWithIdParams(claimId, DQ_CONSIDER_CLAIMANT_DOCUMENTS));
    }
  } catch (error) {
    next(error);
  }
});

export default requestExtra4WeeksController;
