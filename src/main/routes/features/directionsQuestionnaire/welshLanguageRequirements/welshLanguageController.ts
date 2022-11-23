import * as express from 'express';
import {CLAIM_TASK_LIST_URL, DQ_WELSH_LANGUAGE_URL} from '../../../urls';
import {GenericForm} from 'common/form/models/genericForm';
import {
  getDirectionQuestionnaire,
  saveDirectionQuestionnaire,
} from '../../../../services/features/directionsQuestionnaire/directionQuestionnaireService';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {Language} from 'common/models/directionsQuestionnaire/welshLanguageRequirements/language';

const welshLanguageController = express.Router();
const welshLanguageViewPath = 'features/directionsQuestionnaire/welshLanguageRequirements/welsh-language';
const languageProperty = 'language';
const welshLanguageRequirementsProperty = 'welshLanguageRequirements';

function renderView(form: GenericForm<Language>, res: express.Response): void {
  res.render(welshLanguageViewPath, {form});
}

welshLanguageController.get(DQ_WELSH_LANGUAGE_URL, async (req, res, next) => {
  try {
    const directionQuestionnaire = await getDirectionQuestionnaire(req.params.id);
    const welshLanguageRequirements = directionQuestionnaire.welshLanguageRequirements?.language
      ? new Language(directionQuestionnaire.welshLanguageRequirements.language.speakLanguage, directionQuestionnaire.welshLanguageRequirements.language.documentsLanguage)
      : new Language();
    renderView(new GenericForm(welshLanguageRequirements), res);
  } catch (error) {
    next(error);
  }
});

welshLanguageController.post(DQ_WELSH_LANGUAGE_URL, async (req, res, next) => {
  try {
    const claimId = req.params.id;
    const form = new GenericForm(new Language(req.body.speakLanguage, req.body.documentsLanguage));
    form.validateSync();
    if (form.hasErrors()) {
      renderView(form, res);
    } else {
      await saveDirectionQuestionnaire(claimId, form.model, languageProperty, welshLanguageRequirementsProperty);
      res.redirect(constructResponseUrlWithIdParams(claimId, CLAIM_TASK_LIST_URL));
    }
  } catch (error) {
    next(error);
  }
});

export default welshLanguageController;
