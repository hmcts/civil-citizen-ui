import * as express from 'express';
import {DQ_NEXT_12MONTHS_CAN_NOT_HEARING_URL, UNAUTHORISED_URL} from '../../urls';
import {GenericForm} from '../../../common/form/models/genericForm';
import {GenericYesNo} from '../../../common/form/models/genericYesNo';
import {constructResponseUrlWithIdParams} from '../../../common/utils/urlFormatter';
import {
  getGenericOption,
  getGenericOptionForm,
  saveDirectionQuestionnaire,
} from '../../../services/features/directionsQuestionnaire/directionQuestionnaireService';

const next12MonthsCanNotHearingController = express.Router();
const dqPropertyName = 'next12MonthsCanNotHearing';
const dqParentName = 'hearing';

function renderView(form: GenericForm<GenericYesNo>, res: express.Response): void {
  res.render('features/directionsQuestionnaire/next-12Months-can-not-hearing', {form});
}

next12MonthsCanNotHearingController.get(DQ_NEXT_12MONTHS_CAN_NOT_HEARING_URL, async (req, res, next) => {
  try {
    renderView(new GenericForm(await getGenericOption(req.params.id, dqPropertyName, dqParentName)), res);
  } catch (error) {
    next(error);
  }
});

next12MonthsCanNotHearingController.post(DQ_NEXT_12MONTHS_CAN_NOT_HEARING_URL, async (req, res, next) => {
  try {
    const claimId = req.params.id;
    const form = new GenericForm(getGenericOptionForm(req.body.option, dqPropertyName));
    form.validateSync();

    if (form.hasErrors()) {
      renderView(form, res);
    } else {
      await saveDirectionQuestionnaire(claimId, form.model, dqPropertyName, dqParentName);
      res.redirect(constructResponseUrlWithIdParams(claimId, UNAUTHORISED_URL));
    }
  } catch (error) {
    next(error);
  }
});

export default next12MonthsCanNotHearingController;
