import * as express from 'express';
import {CitizenDob} from '../../../../common/form/models/citizenDob';
import {Validator} from 'class-validator';
import {DOB_URL, CITIZEN_PHONE_NUMBER_URL, AGE_ELIGIBILITY_URL} from '../../../../routes/urls';
import {Respondent} from '../../../../common/models/respondent';
import {Claim} from '../../../../common/models/claim';
import {AgeEligibilityVerification} from '../../../../common/utils/ageEligibilityVerification';
import {getCaseDataFromStore, saveDraftClaim} from '../../../../modules/draft-store/draftStoreService';
import {constructResponseUrlWithIdParams} from '../../../../common/utils/urlFormatter';

const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('citizenDobController');

const router = express.Router();

function renderView(res: express.Response, form: CitizenDob): void {
  res.render('features/response/citizenDob/citizen-dob', {form: form});
}

function redirectToNextPage(req: express.Request, res: express.Response, dob: Date) {
  if (AgeEligibilityVerification.isOverEighteen(dob)) {
    res.redirect(constructResponseUrlWithIdParams(req.params.id,CITIZEN_PHONE_NUMBER_URL));
  } else {
    res.redirect(constructResponseUrlWithIdParams(req.params.id,AGE_ELIGIBILITY_URL));
  }
}

router.get(DOB_URL, async (req: express.Request, res: express.Response) => {
  try {
    const citizenDob = new CitizenDob();
    const responseDataRedis: Claim = await getCaseDataFromStore(req.params.id);
    if (responseDataRedis && responseDataRedis.respondent1.dateOfBirth) {
      const dateOfBirth =  new Date(responseDataRedis.respondent1.dateOfBirth);
      citizenDob.day = dateOfBirth.getDay();
      citizenDob.month = (dateOfBirth.getMonth() + 1);
      citizenDob.year = dateOfBirth.getFullYear();
    }
    renderView(res, citizenDob);
  } catch (error) {
    logger.error(error);
  }

});

router.post(DOB_URL.toString(), async (req, res) => {
  try {
    const citizenDob = new CitizenDob(req.body.year, req.body.month, req.body.day);
    const validator = new Validator();
    citizenDob.errors = validator.validateSync(citizenDob);
    if (citizenDob.errors && citizenDob.errors.length > 0) {
      renderView(res, citizenDob);
    } else {
      const respondent = new Respondent();
      respondent.dateOfBirth = citizenDob.dateOfBirth;
      const claim = new Claim();
      claim.respondent1 = respondent;
      await saveDraftClaim(req.params.id, claim);
      redirectToNextPage(req, res, respondent.dateOfBirth);
    }
  } catch (error) {
    logger.error(error);
  }
});

export default router;
