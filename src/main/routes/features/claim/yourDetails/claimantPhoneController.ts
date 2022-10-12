import {NextFunction, Request, Response, Router} from 'express';
import {CLAIMANT_PHONE_NUMBER_URL, CLAIMANT_TASK_LIST_URL} from '../../../urls';
import {GenericForm} from '../../../../common/form/models/genericForm';
import {
  getClaimantPhone,
  saveClaimantPhone,
} from '../../../../services/features/claim/yourDetails/claimantPhoneService';
import {AppRequest} from 'models/AppRequest';
import {CitizenTelephoneNumber} from '../../../../common/form/models/citizenTelephoneNumber';

const claimantPhoneViewPath = 'features/claim/claimant-phone';
const claimantPhoneController = Router();

function renderView(form: GenericForm<CitizenTelephoneNumber>, res: Response): void {
  res.render(claimantPhoneViewPath, {form});
}

claimantPhoneController.get(CLAIMANT_PHONE_NUMBER_URL, async (req: AppRequest,res: Response, next: NextFunction) => {
  try {
    const claimId = req.session.user?.id;
    const form: CitizenTelephoneNumber = await getClaimantPhone(claimId);
    renderView(new GenericForm<CitizenTelephoneNumber>(form), res);
  } catch (error) {
    next(error);
  }
});

claimantPhoneController.post(CLAIMANT_PHONE_NUMBER_URL, async (req: AppRequest | Request, res: Response, next: NextFunction) => {
  try {
    const claimId = (<AppRequest>req).session.user?.id;
    const form: GenericForm<CitizenTelephoneNumber> = new GenericForm(new CitizenTelephoneNumber(req.body.phoneNumber));
    form.validateSync();

    if (form.hasErrors()) {
      renderView(form, res);
    } else {
      await saveClaimantPhone(claimId, form.model);
      res.redirect(CLAIMANT_TASK_LIST_URL);
    }
  } catch (error) {
    next(error);
  }
});

export default claimantPhoneController;
