import * as express from 'express';
import {DQ_EXPERT_DETAILS_URL, DQ_SHARE_AN_EXPERT_URL} from '../../urls';
import {GenericForm} from '../../../common/form/models/genericForm';
import {constructResponseUrlWithIdParams} from '../../../common/utils/urlFormatter';
import {GenericYesNo} from '../../../common/form/models/genericYesNo';
import {
  getSharedExpertForm,
  getSharedExpertSelection,
  saveSharedExpertSelection,
} from '../../../services/features/directionsQuestionnaire/sharedExpertService';

const sharedExpertController = express.Router();

function renderView(sharedExpertForm: GenericForm<GenericYesNo>, res: express.Response): void {
  const form = Object.assign(sharedExpertForm);
  form.option = sharedExpertForm.model.option;
  res.render('features/directionsQuestionnaire/shared-expert', {form});
}

sharedExpertController.get(DQ_SHARE_AN_EXPERT_URL, async (req, res, next) => {
  try {
    renderView(new GenericForm(await getSharedExpertSelection(req.params.id)), res);
  } catch (error) {
    next(error);
  }
});

sharedExpertController.post(DQ_SHARE_AN_EXPERT_URL, async (req, res, next) => {
  try {
    const claimId = req.params.id;
    const sharedExpert = getSharedExpertForm(req.body.option);
    const form = new GenericForm(sharedExpert);
    form.validateSync();

    if (form.hasErrors()) {
      renderView(form, res);
    } else {
      await saveSharedExpertSelection(claimId, sharedExpert);
      res.redirect(constructResponseUrlWithIdParams(claimId, DQ_EXPERT_DETAILS_URL));
    }
  } catch (error) {
    next(error);
  }
});

export default sharedExpertController;
