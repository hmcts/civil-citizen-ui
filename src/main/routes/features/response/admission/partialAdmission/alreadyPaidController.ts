import * as express from 'express';
import {CLAIM_TASK_LIST_URL, CITIZEN_ALREADY_PAID_URL} from '../../../../urls';
import {PartialAdmissionService} from '../../../../../services/features/response/admission/partialAdmission/partialAdmissionService';
import {GenericForm} from '../../../../../common/form/models/genericForm';
import {constructResponseUrlWithIdParams} from '../../../../../common/utils/urlFormatter';
import {GenericYesNo} from '../../../../../common/form/models/genericYesNo';

const alreadyPaidController = express.Router();
const citizenAlreadyPaidViewPath = 'features/response/admission/partialAdmission/already-paid';
const partialAdmissionService = new PartialAdmissionService();

function renderView(form: GenericForm<GenericYesNo>, res: express.Response): void {
  res.render(citizenAlreadyPaidViewPath, {form});
}

alreadyPaidController.get(CITIZEN_ALREADY_PAID_URL, async (req, res, next: express.NextFunction) => {
  try {
    const alreadyPaidForm = new GenericForm(new GenericYesNo(await partialAdmissionService.getClaimAlreadyPaid(req.params.id)));
    renderView(alreadyPaidForm , res);
  } catch (error) {
    next(error);
  }
});

alreadyPaidController.post(CITIZEN_ALREADY_PAID_URL, async (req, res, next: express.NextFunction) => {
  try {
    const alreadyPaidForm = new GenericForm(new GenericYesNo(req.body.option));
    await alreadyPaidForm.validate();

    if (alreadyPaidForm.hasErrors()) {
      renderView(alreadyPaidForm, res);
    } else {
      await partialAdmissionService.saveClaimAlreadyPaid(req.params.id, alreadyPaidForm.model.option);
      res.redirect(constructResponseUrlWithIdParams(req.params.id, CLAIM_TASK_LIST_URL));
    }
  } catch (error) {
    next(error);
  }
});

export default alreadyPaidController;
