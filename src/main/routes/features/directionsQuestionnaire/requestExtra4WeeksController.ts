import * as express from 'express';
import {DQ_REQUEST_EXTRA_4WEEKS_URL, DQ_CONSIDER_CLAIMANT_DOCUMENTS} from '../../urls';
import {GenericForm} from '../../../common/form/models/genericForm';
import {GenericYesNo} from '../../../common/form/models/genericYesNo';
import {constructResponseUrlWithIdParams} from '../../../common/utils/urlFormatter';
import {
  getGenericOption,
  getGenericOptionForm,
  saveDirectionQuestionnaire,
} from '../../../services/features/directionsQuestionnaire/directionQuestionnaireService';

const requestExtra4WeeksController = express.Router();
const requestExtra4weeksErrorMessage = 'ERRORS.VALID_REQUEST_EXTRA_4_WEEKS';
const dqPropertyName = 'requestExtra4weeks';

function renderView(form: GenericForm<GenericYesNo>, res: express.Response): void {
  res.render('features/directionsQuestionnaire/request-extra-4weeks', {form});
}

requestExtra4WeeksController.get(DQ_REQUEST_EXTRA_4WEEKS_URL, async (req, res, next) => {
  try {
    renderView(new GenericForm(await getGenericOption(req.params.id, dqPropertyName, requestExtra4weeksErrorMessage)), res);
  } catch (error) {
    next(error);
  }
});

requestExtra4WeeksController.post(DQ_REQUEST_EXTRA_4WEEKS_URL, async (req, res, next) => {
  try {
    const claimId = req.params.id;
    const form = new GenericForm(getGenericOptionForm(req.body.option, requestExtra4weeksErrorMessage));
    form.validateSync();

    if (form.hasErrors()) {
      renderView(form, res);
    } else {
      await saveDirectionQuestionnaire(claimId, form.model, dqPropertyName);
      res.redirect(constructResponseUrlWithIdParams(claimId, DQ_CONSIDER_CLAIMANT_DOCUMENTS));
    }
  } catch (error) {
    next(error);
  }
});

export default requestExtra4WeeksController;
