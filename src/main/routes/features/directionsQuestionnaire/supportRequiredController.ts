import {NextFunction, Response, Router} from 'express';
import {constructResponseUrlWithIdParams} from '../../../common/utils/urlFormatter';
import {CLAIM_TASK_LIST_URL, SUPPORT_REQUIRED_URL} from '../../urls';
import {GenericForm} from '../../../common/form/models/genericForm';
import {SupportRequired} from '../../../common/models/directionsQuestionnaire/supportRequired';
import {
  getDirectionQuestionnaire,
  saveDirectionQuestionnaire,
} from '../../../services/features/directionsQuestionnaire/directionQuestionnaireService';

const supportRequiredController = Router();
const supportRequiredViewPath = 'features/directionsQuestionnaire/support-required';
const dqPropertyName = 'supportRequired';

function renderView(form: GenericForm<SupportRequired>, res: Response): void {
  res.render(supportRequiredViewPath, {form});
}

supportRequiredController.get(SUPPORT_REQUIRED_URL, async (req, res, next: NextFunction) => {
  try {

    const directionQuestionnaire = await getDirectionQuestionnaire(req.params.id);
    const supportRequired = directionQuestionnaire.supportRequired ?
      directionQuestionnaire.supportRequired : new SupportRequired();

    renderView(new GenericForm(supportRequired), res);
  } catch (error) {
    next(error);
  }
});

supportRequiredController.post(SUPPORT_REQUIRED_URL, async (req, res, next: NextFunction) => {
  try {
    const claimId = req.params.id;
    let supportRequired = new SupportRequired();
    if (req.body.declared) {
      const languageSelected = !!(req.body.declared.includes('languageSelected'));
      const signLanguageSelected = !!(req.body.declared.includes('signLanguageSelected'));
      const disabledAccessSelected = !!(req.body.declared.includes('disabledAccessSelected'));
      const hearingLoopSelected = !!(req.body.declared.includes('hearingLoopSelected'));
      const otherSupportSelected = !!(req.body.declared.includes('otherSupportSelected'));
      supportRequired = new SupportRequired(languageSelected, req.body.languageInterpreted, signLanguageSelected, req.body.signLanguageInterpreted, hearingLoopSelected, disabledAccessSelected, otherSupportSelected, req.body.otherSupport);
    }
    const form = new GenericForm(supportRequired);
    form.validateSync();
    if (form.hasErrors()) {
      res.render(supportRequiredViewPath, {form});
    } else {
      await saveDirectionQuestionnaire(claimId, supportRequired, dqPropertyName);
      res.redirect(constructResponseUrlWithIdParams(claimId, CLAIM_TASK_LIST_URL));
    }
  } catch (error) {
    next(error);
  }
});

export default supportRequiredController;
