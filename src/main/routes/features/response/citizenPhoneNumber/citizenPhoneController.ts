import {NextFunction, RequestHandler, Response, Router} from 'express';
import {
  CitizenTelephoneNumber,
} from 'form/models/citizenTelephoneNumber';
import {CITIZEN_PHONE_NUMBER_URL, RESPONSE_TASK_LIST_URL} from 'routes/urls';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {GenericForm} from 'form/models/genericForm';
import {ClaimantOrDefendant} from 'models/partyType';
import {getTelephone, saveTelephone} from 'services/features/claim/yourDetails/phoneService';
import {AppRequest} from 'common/models/AppRequest';
import {generateRedisKey, getCaseDataFromStore} from 'modules/draft-store/draftStoreService';
import {isCarmEnabledForCase} from 'common/utils/carmToggleUtils';

const citizenPhoneViewPath = 'features/response/citizenPhoneNumber/citizen-phone';
const citizenPhoneController = Router();

function renderView(form: GenericForm<CitizenTelephoneNumber>, res: Response, carmEnabled: boolean): void {
  res.render(citizenPhoneViewPath, {form, carmEnabled: carmEnabled});
}

citizenPhoneController.get(CITIZEN_PHONE_NUMBER_URL, (async (req, res, next: NextFunction) => {
  try {
    const citizenTelephoneNumber: CitizenTelephoneNumber = await getTelephone(generateRedisKey(<AppRequest>req), ClaimantOrDefendant.DEFENDANT);
    const redisKey = generateRedisKey(<AppRequest>req);
    const claim = await getCaseDataFromStore(redisKey);
    const carmEnabled = await isCarmEnabledForCase(claim.submittedDate);
    renderView(new GenericForm<CitizenTelephoneNumber>(citizenTelephoneNumber), res, carmEnabled);
  } catch (error) {
    next(error);
  }
}) as RequestHandler);
citizenPhoneController.post(CITIZEN_PHONE_NUMBER_URL,
  (async (req, res, next: NextFunction) => {
    try {
      const redisKey = generateRedisKey(<AppRequest>req);
      const claim = await getCaseDataFromStore(redisKey);
      const carmEnabled = await isCarmEnabledForCase(claim.submittedDate);
      const model: CitizenTelephoneNumber = new CitizenTelephoneNumber(req.body.telephoneNumber === '' ? undefined : req.body.telephoneNumber, undefined, carmEnabled);
      const citizenTelephoneNumberForm = new GenericForm(model);
      citizenTelephoneNumberForm.validateSync();
      if (citizenTelephoneNumberForm.hasErrors()) {
        renderView(citizenTelephoneNumberForm, res, carmEnabled);
      } else {
        await saveTelephone(generateRedisKey(<AppRequest>req), model, ClaimantOrDefendant.DEFENDANT);
        const redirectURL = constructResponseUrlWithIdParams(req.params.id, RESPONSE_TASK_LIST_URL);
        res.redirect(redirectURL);
      }
    } catch (error) {
      next(error);
    }
  }) as RequestHandler);

export default citizenPhoneController;
