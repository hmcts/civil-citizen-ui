import * as express from 'express';
import {CLAIM_TASK_LIST_URL, DQ_WELSH_LANGUAGE_URL} from '../../urls';
import {GenericForm} from '../../../common/form/models/genericForm';
import {
  getDirectionQuestionnaire,
  saveDirectionQuestionnaire,
} from '../../../services/features/directionsQuestionnaire/directionQuestionnaireService';
import {constructResponseUrlWithIdParams} from '../../../common/utils/urlFormatter';
import {WelshLanguageRequirements} from '../../../common/models/directionsQuestionnaire/welshLanguageRequirements';

const welshLanguageController = express.Router();
const welshLanguageViewPath = 'features/directionsQuestionnaire/welsh-language';
const welshLanguageRequirementsProperty = 'welshLanguageRequirements';

function renderView(form: GenericForm<WelshLanguageRequirements>, res: express.Response): void {
  res.render(welshLanguageViewPath, { form });
}

welshLanguageController.get(DQ_WELSH_LANGUAGE_URL, async (req, res, next) => {
  try {
    const directionQuestionnaire = await getDirectionQuestionnaire(req.params.id);
    const welshLanguageRequirements = directionQuestionnaire.welshLanguageRequirements
      ? new WelshLanguageRequirements(directionQuestionnaire.welshLanguageRequirements.speakLanguage, directionQuestionnaire.welshLanguageRequirements.documentsLanguage)
      : new WelshLanguageRequirements();
    renderView(new GenericForm(welshLanguageRequirements), res);
  } catch (error) {
    next(error);
  }
});

welshLanguageController.post(DQ_WELSH_LANGUAGE_URL, async (req, res, next) => {
  try {
    const claimId = req.params.id;
    const form = new GenericForm(new WelshLanguageRequirements(req.body.speakLanguage, req.body.documentsLanguage));
    form.validateSync();
    if (form.hasErrors()) {
      renderView(form, res);
    } else {
      await saveDirectionQuestionnaire(claimId, form.model, welshLanguageRequirementsProperty);
      res.redirect(constructResponseUrlWithIdParams(claimId, CLAIM_TASK_LIST_URL));
    }
  } catch (error) {
    next(error);
  }
});

export default welshLanguageController;
