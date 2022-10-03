import * as express from 'express';
import {CLAIMANT_PHONE_NUMBER_URL, CLAIMANT_TASK_LIST_URL} from '../../../urls';
import {GenericForm} from '../../../../common/form/models/genericForm';
import {getClaimantPhone,saveClaimantPhone} from '../../../../../main/services/features/claim/claimantPhoneService';
import {AppRequest} from 'common/models/AppRequest';
import {CitizenTelephoneNumber} from '../../../../common/form/models/citizenTelephoneNumber';

const claimantPhoneViewPath = 'features/public/claim/claimant-phone';
const claimantPhoneController = express.Router();

function renderView(form: GenericForm<CitizenTelephoneNumber>, res: express.Response): void {
  res.render(claimantPhoneViewPath, {form});
}

claimantPhoneController.get(CLAIMANT_PHONE_NUMBER_URL, async (req: AppRequest,res: express.Response, next: express.NextFunction) => {
  try {
    const claimId = req.session?.user?.id;
    const form: CitizenTelephoneNumber = await getClaimantPhone(claimId);
    renderView(new GenericForm<CitizenTelephoneNumber>(form),res);
  } catch (error) {
    next(error);
  }
});

claimantPhoneController.post(CLAIMANT_PHONE_NUMBER_URL, async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const form: GenericForm<CitizenTelephoneNumber> = new GenericForm(new CitizenTelephoneNumber(req.body.phoneNumber));
    form.validateSync();

    if (form.hasErrors()) {
      renderView(form, res);
    } else {
      await saveClaimantPhone(req.params.id,form.model);
      res.redirect(CLAIMANT_TASK_LIST_URL);
    }
  } catch (error) {
    next(error);
  }
});

export default claimantPhoneController;
