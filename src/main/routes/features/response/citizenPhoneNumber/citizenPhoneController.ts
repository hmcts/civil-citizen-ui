import {NextFunction, Response, Router} from 'express';
import {CitizenTelephoneNumber} from '../../../../common/form/models/citizenTelephoneNumber';
import {CITIZEN_PHONE_NUMBER_URL, CLAIM_TASK_LIST_URL} from '../../../urls';
import {constructResponseUrlWithIdParams} from '../../../../common/utils/urlFormatter';
import {GenericForm} from '../../../../common/form/models/genericForm';
import {ClaimantOrDefendant} from '../../../../common/models/partyType';
import {getTelephone, saveTelephone} from '../../../../services/features/claim/yourDetails/phoneService';

const citizenPhoneViewPath = 'features/response/citizenPhoneNumber/citizen-phone';
const citizenPhoneController = Router();

function renderView(form: GenericForm<CitizenTelephoneNumber>, res: Response): void {
  res.render(citizenPhoneViewPath, {form});
}

citizenPhoneController.get(CITIZEN_PHONE_NUMBER_URL, async (req, res, next: NextFunction) => {
  try {
    const citizenTelephoneNumber: CitizenTelephoneNumber = await getTelephone(req.params.id, ClaimantOrDefendant.DEFENDANT);
    renderView(new GenericForm<CitizenTelephoneNumber>(citizenTelephoneNumber), res);
  } catch (error) {
    next(error);
  }
});
citizenPhoneController.post(CITIZEN_PHONE_NUMBER_URL,
  async (req, res, next: NextFunction) => {
    try {
      const model: CitizenTelephoneNumber = new CitizenTelephoneNumber(req.body.telephoneNumber);
      const citizenTelephoneNumberForm = new GenericForm(model);
      citizenTelephoneNumberForm.validateSync();
      if (citizenTelephoneNumberForm.hasErrors()) {
        renderView(citizenTelephoneNumberForm, res);
      } else {
        await saveTelephone(req.params.id, model, ClaimantOrDefendant.DEFENDANT);
        const redirectURL = constructResponseUrlWithIdParams(req.params.id, CLAIM_TASK_LIST_URL);
        res.redirect(redirectURL);
      }
    } catch (error) {
      next(error);
    }
  });

export default citizenPhoneController;
