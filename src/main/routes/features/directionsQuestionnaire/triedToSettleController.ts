import * as express from 'express';
import {DQ_TRIED_TO_SETTLE_CLAIM_URL, DQ_REQUEST_EXTRA_4WEEKS_URL} from '../../urls';
import {GenericForm} from '../../../common/form/models/genericForm';
import {constructResponseUrlWithIdParams} from '../../../common/utils/urlFormatter';
import {GenericYesNo} from '../../../common/form/models/genericYesNo';
import {
  getGenericOption,
  getGenericOptionForm,
  saveDirectionQuestionnaire,
} from '../../../services/features/directionsQuestionnaire/directionQuestionnaireService';

const triedToSettleController = express.Router();
const errorMessage = 'ERRORS.VALID_TRIED_TO_SETTLE';
const dqPropertyName = 'triedToSettle';

function renderView(form: GenericForm<GenericYesNo>, res: express.Response): void {
  res.render('features/directionsQuestionnaire/tried-to-settle-claim', {form});
}

triedToSettleController.get(DQ_TRIED_TO_SETTLE_CLAIM_URL, async (req, res, next) => {
  try {
    renderView(new GenericForm(await getGenericOption(req.params.id, dqPropertyName, errorMessage)), res);
  } catch (error) {
    next(error);
  }
});

triedToSettleController.post(DQ_TRIED_TO_SETTLE_CLAIM_URL, async (req, res, next) => {
  try {
    const claimId = req.params.id;
    const triedToSettle = getGenericOptionForm(req.body.option, errorMessage);
    const form = new GenericForm(triedToSettle);
    form.validateSync();

    if (form.hasErrors()) {
      renderView(form, res);
    } else {
      await saveDirectionQuestionnaire(claimId, form.model, dqPropertyName);
      res.redirect(constructResponseUrlWithIdParams(claimId, DQ_REQUEST_EXTRA_4WEEKS_URL));
    }
  } catch (error) {
    next(error);
  }
});

export default triedToSettleController;
