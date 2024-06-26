import {NextFunction, Request, RequestHandler, Response, Router} from 'express';
import {CitizenDob} from 'form/models/citizenDob';
import {AGE_ELIGIBILITY_URL, CITIZEN_PHONE_NUMBER_URL, DOB_URL, RESPONSE_TASK_LIST_URL} from 'routes/urls';
import {Party} from 'models/party';
import {Claim} from 'models/claim';
import {AgeEligibilityVerification} from 'common/utils/ageEligibilityVerification';
import {getCaseDataFromStore, saveDraftClaim} from 'modules/draft-store/draftStoreService';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {GenericForm} from 'form/models/genericForm';
import {CitizenDate} from 'form/models/claim/claimant/citizenDate';
import {generateRedisKey} from 'modules/draft-store/draftStoreService';
import {AppRequest} from 'common/models/AppRequest';

const citizenDobController = Router();

function renderView(form: GenericForm<CitizenDob>, res: Response): void {
  res.render('features/response/citizenDob/citizen-dob', {form: form, today: new Date()});
}

function redirectToNextPage(req: Request, res: Response, dob: Date, respondent: Party) {
  if (!AgeEligibilityVerification.isOverEighteen(dob)) {
    return res.redirect(constructResponseUrlWithIdParams(req.params.id, AGE_ELIGIBILITY_URL));
  }
  if (respondent?.partyPhone?.phone && respondent?.partyPhone?.ccdPhoneExist) {
    res.redirect(constructResponseUrlWithIdParams(req.params.id, RESPONSE_TASK_LIST_URL));
  } else {
    res.redirect(constructResponseUrlWithIdParams(req.params.id, CITIZEN_PHONE_NUMBER_URL));
  }
}

citizenDobController.get(DOB_URL, (async (req: Request, res: Response, next: NextFunction) => {
  const {year, month, day} = req.body;
  try {
    const citizenDob = new GenericForm(new CitizenDob(year, month, day));
    const responseDataRedis: Claim = await getCaseDataFromStore(generateRedisKey(<AppRequest>req));
    if (responseDataRedis?.respondent1?.dateOfBirth) {
      const dateOfBirth = new Date(responseDataRedis.respondent1.dateOfBirth.date);
      citizenDob.model.day = dateOfBirth.getDate();
      citizenDob.model.month = (dateOfBirth.getMonth() + 1);
      citizenDob.model.year = dateOfBirth.getFullYear();
    }
    renderView(citizenDob, res);
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

citizenDobController.post(DOB_URL, (async (req, res, next: NextFunction) => {
  const {year, month, day} = req.body;
  const redisKey = generateRedisKey(<AppRequest>req);
  try {
    const citizenDob = new GenericForm(new CitizenDob(year, month, day));
    await citizenDob.validate();
    if (citizenDob.hasErrors()) {
      renderView(citizenDob, res);
    } else {
      const claim = await getCaseDataFromStore(redisKey);
      if (claim.respondent1) {
        claim.respondent1.dateOfBirth = new CitizenDate(day, month, year);
      } else {
        const respondent = new Party();
        respondent.dateOfBirth = new CitizenDate(day, month, year);
        claim.respondent1 = respondent;
      }
      await saveDraftClaim(redisKey, claim);
      redirectToNextPage(req, res, claim.respondent1.dateOfBirth.date, claim.respondent1);
    }
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

export default citizenDobController;
