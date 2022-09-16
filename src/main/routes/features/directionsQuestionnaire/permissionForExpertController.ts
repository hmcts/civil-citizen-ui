import * as express from 'express';
import {DQ_EXPERT_EXAMINATION_URL, DQ_GIVE_EVIDENCE_YOURSELF_URL, PERMISSION_FOR_EXPERT_URL} from '../../urls';
import {GenericForm} from '../../../common/form/models/genericForm';
import {constructResponseUrlWithIdParams} from '../../../common/utils/urlFormatter';
import {GenericYesNo} from '../../../common/form/models/genericYesNo';
import {
  getPermissionForExpert,
  getPermissionForExpertForm,
  savePermissionForExpert,
} from '../../../services/features/directionsQuestionnaire/permissionForExpertService';
import {YesNo} from '../../../common/form/models/yesNo';

const permissionForExpertController = express.Router();

function renderView(permissionForExpert: GenericForm<GenericYesNo>, res: express.Response): void {
  const form = Object.assign(permissionForExpert);
  form.option = permissionForExpert.model.option;
  res.render('features/directionsQuestionnaire/permission-for-expert', {form});
}

permissionForExpertController.get(PERMISSION_FOR_EXPERT_URL, async (req, res, next) => {
  try {
    renderView(new GenericForm(await getPermissionForExpert(req.params.id)), res);
  } catch (error) {
    next(error);
  }
});

permissionForExpertController.post(PERMISSION_FOR_EXPERT_URL, async (req, res, next) => {
  try {
    const claimId = req.params.id;
    const permissionForExpert = getPermissionForExpertForm(req.body.option);
    const form = new GenericForm(permissionForExpert);
    form.validateSync();

    if (form.hasErrors()) {
      renderView(form, res);
    } else {
      await savePermissionForExpert(claimId, permissionForExpert);
      (form.model.option === YesNo.YES) ?
        res.redirect(constructResponseUrlWithIdParams(claimId, DQ_EXPERT_EXAMINATION_URL)) :
        res.redirect(constructResponseUrlWithIdParams(claimId, DQ_GIVE_EVIDENCE_YOURSELF_URL));
    }
  } catch (error) {
    next(error);
  }
});

export default permissionForExpertController;
