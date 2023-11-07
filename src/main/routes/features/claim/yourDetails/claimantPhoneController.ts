import {NextFunction, Request, Response, Router} from 'express';
import {CLAIMANT_PHONE_NUMBER_URL, CLAIMANT_TASK_LIST_URL} from '../../../urls';
import {GenericForm} from '../../../../common/form/models/genericForm';
import {getTelephone, saveTelephone} from '../../../../services/features/claim/yourDetails/phoneService';
import {AppRequest} from '../../../../common/models/AppRequest';
import {CitizenTelephoneNumber} from '../../../../common/form/models/citizenTelephoneNumber';
import {ClaimantOrDefendant} from '../../../../common/models/partyType';

const claimantPhoneViewPath = 'features/claim/claimant-phone';
const claimantPhoneController = Router();

function renderView(form: GenericForm<CitizenTelephoneNumber>, res: Response): void {
  res.render(claimantPhoneViewPath, {form});
}

claimantPhoneController.get(CLAIMANT_PHONE_NUMBER_URL, async (req: AppRequest, res: Response, next: NextFunction) => {
  try {
    const claimId = req.session.user?.id;
    const form: CitizenTelephoneNumber = await getTelephone(claimId, ClaimantOrDefendant.CLAIMANT);
    renderView(new GenericForm<CitizenTelephoneNumber>(form), res);
  } catch (error) {
    next(error);
  }
});

claimantPhoneController.post(CLAIMANT_PHONE_NUMBER_URL, async (req: AppRequest | Request, res: Response, next: NextFunction) => {
  try {
    const claimId = (<AppRequest>req).session.user?.id;

    const form: GenericForm<CitizenTelephoneNumber> = new GenericForm(new CitizenTelephoneNumber(req.body.telephoneNumber));
    form.validateSync();

    if (form.hasErrors()) {
      renderView(form, res);
    } else {
      await saveTelephone(claimId, form.model, ClaimantOrDefendant.CLAIMANT);
      res.redirect(CLAIMANT_TASK_LIST_URL);
    }
  } catch (error) {
    next(error);
  }
});

export default claimantPhoneController;
