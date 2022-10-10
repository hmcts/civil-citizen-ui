import * as express from 'express';
import {GenericForm} from '../../../common/form/models/genericForm';
import {DQ_DEFENDANT_WITNESSES_URL,DQ_OTHER_WITNESSES_AVAILABILITY_DATES_FOR_HEARING_URL} from '../../urls';
import {OtherWitnesses} from '../../../common/models/directionsQuestionnaire/witnesses/otherWitnesses';
import {constructResponseUrlWithIdParams} from '../../../common/utils/urlFormatter';
import {saveDirectionQuestionnaire} from '../../../../main/services/features/directionsQuestionnaire/directionQuestionnaireService';
import {
  getOtherWitnessDetailsForm,
  getOtherWitnesses,
} from '../../../services/features/directionsQuestionnaire/otherWitnessesService';

const otherWitnessesController = express.Router();
const otherWitnessesViewPath = 'features/directionsQuestionnaire/otherWitnesses/other-witnesses';
const dqPropertyName = 'otherWitnesses';
const dqParentName = 'witnesses';

function renderView(form: GenericForm<OtherWitnesses>, res: express.Response): void {
  res.render(otherWitnessesViewPath, {form});
}

otherWitnessesController.get(DQ_DEFENDANT_WITNESSES_URL, async (req, res, next: express.NextFunction) => {
  try {
    const form = new GenericForm(await getOtherWitnesses(req));
    res.render(otherWitnessesViewPath, {form});
  } catch (error) {
    next(error);
  }
});

otherWitnessesController.post(DQ_DEFENDANT_WITNESSES_URL,
  async (req, res, next: express.NextFunction) => {
    try {
      const form: GenericForm<OtherWitnesses> = new GenericForm(new OtherWitnesses(req.body.option, getOtherWitnessDetailsForm(req)));
      form.validateSync();
      if (form.hasErrors()) {
        renderView(form, res);
      } else {
        await saveDirectionQuestionnaire(req.params.id, form.model, dqPropertyName, dqParentName);
        res.redirect(constructResponseUrlWithIdParams(req.params.id, DQ_OTHER_WITNESSES_AVAILABILITY_DATES_FOR_HEARING_URL));
      }
    } catch (error) {
      next(error);
    }
  });

export default otherWitnessesController;
