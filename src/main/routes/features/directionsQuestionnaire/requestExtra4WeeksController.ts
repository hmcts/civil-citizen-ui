import * as express from 'express';
import {DQ_CONSIDER_CLAIMANT_DOCUMENTS_URL, DQ_REQUEST_EXTRA_4WEEKS_URL} from '../../urls';
import {GenericForm} from '../../../common/form/models/genericForm';
import {GenericYesNo} from '../../../common/form/models/genericYesNo';
import {constructResponseUrlWithIdParams} from '../../../common/utils/urlFormatter';
import {
  getGenericOption,
  getGenericOptionForm,
  saveDirectionQuestionnaire,
} from '../../../services/features/directionsQuestionnaire/directionQuestionnaireService';

const requestExtra4WeeksController = express.Router();
const dqPropertyName = 'requestExtra4weeks';
const dqParentName = 'experts';

function renderView(form: GenericForm<GenericYesNo>, res: express.Response): void {
  res.render('features/directionsQuestionnaire/request-extra-4weeks', {form});
}

requestExtra4WeeksController.get(DQ_REQUEST_EXTRA_4WEEKS_URL, async (req, res, next) => {
  try {
    renderView(new GenericForm(await getGenericOption(req.params.id, dqPropertyName, dqParentName)), res);
  } catch (error) {
    next(error);
  }
});

requestExtra4WeeksController.post(DQ_REQUEST_EXTRA_4WEEKS_URL, async (req, res, next) => {
  try {
    const claimId = req.params.id;
    const form = new GenericForm(getGenericOptionForm(req.body.option, dqPropertyName));
    form.validateSync();

    if (form.hasErrors()) {
      renderView(form, res);
    } else {
      await saveDirectionQuestionnaire(claimId, form.model, dqPropertyName, dqParentName);
      res.redirect(constructResponseUrlWithIdParams(claimId, DQ_CONSIDER_CLAIMANT_DOCUMENTS_URL));
    }
  } catch (error) {
    next(error);
  }
});

export default requestExtra4WeeksController;
