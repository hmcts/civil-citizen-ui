import * as express from 'express';
import {CLAIM_TASK_LIST_URL, CITIZEN_ALREADY_PAID_URL} from '../../../../urls';
import {AlreadyPaid} from '../../../../../common/form/models/admission/partialAdmission/alreadyPaid';
import {PartialAdmissionService} from '../../../../../modules/admission/partialAdmission/partialAdmissionService';
import {GenericForm} from '../../../../../common/form/models/genericForm';
import {constructResponseUrlWithIdParams} from '../../../../../common/utils/urlFormatter';

const alreadyPaidController = express.Router();
const citizenAlreadyPaidViewPath = 'features/response/admission/partialAdmission/already-paid';
const partialAdmissionService = new PartialAdmissionService();

function renderView(form: GenericForm<AlreadyPaid>, res: express.Response): void {
  res.render(citizenAlreadyPaidViewPath, {form});
}

alreadyPaidController.get(CITIZEN_ALREADY_PAID_URL, async (req, res) => {
  try {
    const alreadyPaid = new AlreadyPaid(await partialAdmissionService.getClaimAlreadyPaid(req.params.id));
    const alreadyPaidForm = new GenericForm(alreadyPaid);
    renderView(alreadyPaidForm , res);
  } catch (error) {
    res.status(500).send({error: error.message});
  }
});

alreadyPaidController.post(CITIZEN_ALREADY_PAID_URL, async (req, res) => {
  try {
    const alreadyPaidData = new AlreadyPaid(req.body.alreadyPaid);
    const alreadyPaidForm = new GenericForm(alreadyPaidData);
    await alreadyPaidForm.validate();

    if (alreadyPaidForm.hasErrors()) {
      renderView(alreadyPaidForm, res);
    } else {
      await partialAdmissionService.saveClaimAlreadyPaid(req.params.id, alreadyPaidData.alreadyPaid);
      res.redirect(constructResponseUrlWithIdParams(req.params.id, CLAIM_TASK_LIST_URL));
    }
  } catch (error) {
    res.status(500).send({error: error.message});
  }
});

export default alreadyPaidController;
