import * as express from 'express';
import {ClaimantPhoneNumber} from '../../../../common/form/models/claim/claimantPhoneNumber';
import {CLAIMANT_PHONE_NUMBER_URL, CLAIMANT_TASK_LIST_URL} from '../../../urls';
import {GenericForm} from '../../../../common/form/models/genericForm';
import {getClaimantPhone,saveClaimantPhone} from '../../../../../main/services/features/claim/claimantPhoneService'; //getUserId,
import {AppRequest} from 'common/models/AppRequest';

const claimantPhoneViewPath = 'features/public/claim/claimant-phone';
const claimantPhoneController = express.Router();

function renderView(form: GenericForm<ClaimantPhoneNumber>, res: express.Response): void {
  res.render(claimantPhoneViewPath, {form});
}

claimantPhoneController.get(CLAIMANT_PHONE_NUMBER_URL, async (req: AppRequest,res: express.Response, next: express.NextFunction) => {
  try {
    const claimId = req.session?.user?.id;
    const form: ClaimantPhoneNumber = await getClaimantPhone(claimId);
    renderView(new GenericForm<ClaimantPhoneNumber>(form),res);
  } catch (error) {
    next(error);
  }
});

claimantPhoneController.post(CLAIMANT_PHONE_NUMBER_URL, async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const form: GenericForm<ClaimantPhoneNumber> = new GenericForm(new ClaimantPhoneNumber(req.body.phoneNumber));
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
