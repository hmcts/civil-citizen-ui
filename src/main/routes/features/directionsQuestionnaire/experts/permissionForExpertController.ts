import {Response, Router} from 'express';
import {
  DQ_EXPERT_DETAILS_URL, 
  DQ_GIVE_EVIDENCE_YOURSELF_URL, 
  PERMISSION_FOR_EXPERT_URL
} from '../../../urls';
import {GenericForm} from '../../../../common/form/models/genericForm';
import {constructResponseUrlWithIdParams} from '../../../../common/utils/urlFormatter';
import {GenericYesNo} from '../../../../common/form/models/genericYesNo';
import {YesNo} from '../../../../common/form/models/yesNo';
import {
  getGenericOption,
  getGenericOptionForm,
  saveDirectionQuestionnaire,
} from '../../../../services/features/directionsQuestionnaire/directionQuestionnaireService';

const permissionForExpertController = Router();
const permissionForExpertViewPath = 'features/directionsQuestionnaire/experts/permission-for-expert';
const dqPropertyName = 'permissionForExpert';
const dqParentName = 'experts';

function renderView(form: GenericForm<GenericYesNo>, res: Response): void {
  res.render(permissionForExpertViewPath, {form});
}

permissionForExpertController.get(PERMISSION_FOR_EXPERT_URL, async (req, res, next) => {
  try {
    const permissionForExpert = await getGenericOption(req.params.id, dqPropertyName, dqParentName);
    renderView(new GenericForm(permissionForExpert), res);
  } catch (error) {
    next(error);
  }
});

permissionForExpertController.post(PERMISSION_FOR_EXPERT_URL, async (req, res, next) => {
  try {
    const claimId = req.params.id;
    const permissionForExpert = new GenericForm(getGenericOptionForm(req.body.option, dqPropertyName));
    permissionForExpert.validateSync();

    if (permissionForExpert.hasErrors()) {
      renderView(permissionForExpert, res);
    } else {
      await saveDirectionQuestionnaire(claimId, permissionForExpert.model, dqPropertyName, dqParentName);
      (permissionForExpert.model.option === YesNo.YES) ?
        res.redirect(constructResponseUrlWithIdParams(claimId, DQ_EXPERT_DETAILS_URL)) :
        res.redirect(constructResponseUrlWithIdParams(claimId, DQ_GIVE_EVIDENCE_YOURSELF_URL));
    }
  } catch (error) {
    next(error);
  }
});

export default permissionForExpertController;
