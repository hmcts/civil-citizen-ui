import {NextFunction, Request, RequestHandler, Response, Router} from 'express';
import {CLAIM_DEFENDANT_PHONE_NUMBER_URL, CLAIMANT_TASK_LIST_URL} from 'routes/urls';
import {GenericForm} from 'form/models/genericForm';
import {getTelephone, saveTelephone} from 'services/features/claim/yourDetails/phoneService';
import {AppRequest} from 'common/models/AppRequest';
import {CitizenTelephoneNumber} from 'form/models/citizenTelephoneNumber';
import {ClaimantOrDefendant} from 'models/partyType';

const defendantPhoneViewPath = 'features/public/claim/defendant-phone';
const defendantPhoneController = Router();

function renderView(form: GenericForm<CitizenTelephoneNumber>, res: Response): void {
  res.render(defendantPhoneViewPath, {form});
}

defendantPhoneController.get(CLAIM_DEFENDANT_PHONE_NUMBER_URL, (async (req: AppRequest, res: Response, next: NextFunction) => {
  try {
    const claimId = req.session.user?.id;
    const form: CitizenTelephoneNumber = await getTelephone(claimId, ClaimantOrDefendant.DEFENDANT);
    renderView(new GenericForm<CitizenTelephoneNumber>(form), res);
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

defendantPhoneController.post(CLAIM_DEFENDANT_PHONE_NUMBER_URL, (async (req: AppRequest | Request, res: Response, next: NextFunction) => {
  try {
    const claimId = (<AppRequest>req).session.user?.id;
    const form: GenericForm<CitizenTelephoneNumber> = new GenericForm(new CitizenTelephoneNumber(req.body.telephoneNumber));
    form.validateSync();

    if (form.hasErrors()) {
      renderView(form, res);
    } else {
      await saveTelephone(claimId, form.model, ClaimantOrDefendant.DEFENDANT);
      res.redirect(CLAIMANT_TASK_LIST_URL);
    }
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

export default defendantPhoneController;
