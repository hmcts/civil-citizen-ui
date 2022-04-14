import * as express from 'express';
import {CITIZEN_ALREADY_PAID_URL} from '../../../../urls';
import {AlreadyPaid} from 'common/form/models/admission/partialAdmission/alreadyPaid';
import {PartialAdmissionService} from 'modules/admission/partialAdmission/partialAdmissionService';
import {GenericForm} from 'common/form/models/genericForm';

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

export default alreadyPaidController;
