import * as express from 'express';
import {CitizenDob} from '../../../../common/form/models/citizenDob';
import {DOB_URL, CITIZEN_PHONE_NUMBER_URL, AGE_ELIGIBILITY_URL} from '../../../../routes/urls';
import {Respondent} from '../../../../common/models/respondent';
import {Claim} from '../../../../common/models/claim';
import {AgeEligibilityVerification} from '../../../../common/utils/ageEligibilityVerification';
import {getCaseDataFromStore, saveDraftClaim} from '../../../../modules/draft-store/draftStoreService';
import {constructResponseUrlWithIdParams} from '../../../../common/utils/urlFormatter';
import {GenericForm} from '../../../../common/form/models/genericForm';

const citizenDobController = express.Router();

function renderView(form: GenericForm<CitizenDob>, res: express.Response): void {
  res.render('features/response/citizenDob/citizen-dob', {form: form});
}

function redirectToNextPage(req: express.Request, res: express.Response, dob: Date) {
  if (AgeEligibilityVerification.isOverEighteen(dob)) {
    res.redirect(constructResponseUrlWithIdParams(req.params.id, CITIZEN_PHONE_NUMBER_URL));
  } else {
    res.redirect(constructResponseUrlWithIdParams(req.params.id, AGE_ELIGIBILITY_URL));
  }
}

citizenDobController.get(DOB_URL, async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const { year, month, day } = req.body;
  try {
    const citizenDob = new GenericForm(new CitizenDob(year, month, day));
    const responseDataRedis: Claim = await getCaseDataFromStore(req.params.id);
    if (responseDataRedis?.respondent1?.dateOfBirth) {
      const dateOfBirth =  new Date(responseDataRedis.respondent1.dateOfBirth);
      citizenDob.model.day = dateOfBirth.getDate();
      citizenDob.model.month = (dateOfBirth.getMonth() + 1);
      citizenDob.model.year = dateOfBirth.getFullYear();
    }
    renderView(citizenDob, res);
  } catch (error) {
    next(error);
  }
});

citizenDobController.post(DOB_URL, async (req, res, next: express.NextFunction) => {
  const { year, month, day } = req.body;
  try {
    const citizenDob = new GenericForm(new CitizenDob(year, month, day));
    await citizenDob.validate();
    if (citizenDob.hasErrors()) {
      renderView(citizenDob, res);
    } else {
      const claim = await getCaseDataFromStore(req.params.id);
      if (claim.respondent1){
        claim.respondent1.dateOfBirth = citizenDob.model.dateOfBirth;
      } else {
        const respondent = new Respondent();
        respondent.dateOfBirth = citizenDob.model.dateOfBirth;
        claim.respondent1 = respondent;
      }
      await saveDraftClaim(req.params.id, claim);
      redirectToNextPage(req, res, claim.respondent1.dateOfBirth);
    }
  } catch (error) {
    next(error);
  }
});

export default citizenDobController;
