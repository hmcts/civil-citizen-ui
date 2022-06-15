import * as express from 'express';
import {CLAIM_TASK_LIST_URL, CITIZEN_ALREADY_PAID_URL} from '../../../../urls';
import {AlreadyPaid} from '../../../../../common/form/models/admission/partialAdmission/alreadyPaid';
import {PartialAdmissionService} from '../../../../../services/features/response/admission/partialAdmission/partialAdmissionService';
import {GenericForm} from '../../../../../common/form/models/genericForm';
import {constructResponseUrlWithIdParams} from '../../../../../common/utils/urlFormatter';

const alreadyPaidController = express.Router();
const citizenAlreadyPaidViewPath = 'features/response/admission/partialAdmission/already-paid';
const partialAdmissionService = new PartialAdmissionService();

function renderView(form: GenericForm<AlreadyPaid>, res: express.Response): void {
  const alreadyPaid = Object.assign(form);
  alreadyPaid.option = form.model.option;
  res.render(citizenAlreadyPaidViewPath, {form});
}

alreadyPaidController.get(CITIZEN_ALREADY_PAID_URL, async (req, res) => {
  try {
    const alreadyPaidForm = new GenericForm(new AlreadyPaid(await partialAdmissionService.getClaimAlreadyPaid(req.params.id)));
    renderView(alreadyPaidForm , res);
  } catch (error) {
    res.status(500).send({error: error.message});
  }
});

alreadyPaidController.post(CITIZEN_ALREADY_PAID_URL, async (req, res) => {
  try {
    const alreadyPaidForm = new GenericForm(new AlreadyPaid(req.body.option));
    await alreadyPaidForm.validate();

    if (alreadyPaidForm.hasErrors()) {
      renderView(alreadyPaidForm, res);
    } else {
      await partialAdmissionService.saveClaimAlreadyPaid(req.params.id, alreadyPaidForm.model.option);
      res.redirect(constructResponseUrlWithIdParams(req.params.id, CLAIM_TASK_LIST_URL));
    }
  } catch (error) {
    res.status(500).send({error: error.message});
  }
});

export default alreadyPaidController;
