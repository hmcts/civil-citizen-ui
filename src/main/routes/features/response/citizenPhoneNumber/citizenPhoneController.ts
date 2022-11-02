import {NextFunction, Response, Router} from 'express';
import {CitizenTelephoneNumber} from '../../../../common/form/models/citizenTelephoneNumber';
import {CITIZEN_PHONE_NUMBER_URL, CLAIM_TASK_LIST_URL} from '../../../urls';
import {Party} from '../../../../common/models/party';
import {Claim} from '../../../../common/models/claim';
import {getCaseDataFromStore, saveDraftClaim} from '../../../../modules/draft-store/draftStoreService';
import {constructResponseUrlWithIdParams} from '../../../../common/utils/urlFormatter';
import {GenericForm} from '../../../../common/form/models/genericForm';

const citizenPhoneViewPath = 'features/response/citizenPhoneNumber/citizen-phone';
const citizenPhoneController = Router();

function renderView(form: GenericForm<CitizenTelephoneNumber>, res: Response): void {
  res.render(citizenPhoneViewPath, {form});
}

citizenPhoneController.get(CITIZEN_PHONE_NUMBER_URL, async (req, res, next: NextFunction) => {
  try {
    const responseDataRedis: Claim = await getCaseDataFromStore(req.params.id);
    const citizenTelephoneNumber = responseDataRedis?.respondent1?.partyPhone
      ? new GenericForm(new CitizenTelephoneNumber(responseDataRedis.respondent1.partyPhone.phone)) : new GenericForm(new CitizenTelephoneNumber());
    renderView(citizenTelephoneNumber, res);
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
        const claim = await getCaseDataFromStore(req.params.id) || new Claim();
        if (claim.respondent1) {
          claim.respondent1.partyPhone.phone = model.telephoneNumber;
        } else {
          const respondent = new Party();
          respondent.partyPhone.phone = model.telephoneNumber;
          claim.respondent1 = respondent;
        }
        await saveDraftClaim(req.params.id, claim);
        const redirectURL = constructResponseUrlWithIdParams(req.params.id, CLAIM_TASK_LIST_URL);
        res.redirect(redirectURL);
      }
    } catch (error) {
      next(error);
    }
  });

export default citizenPhoneController;
