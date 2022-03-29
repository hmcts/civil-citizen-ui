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
const validator = new Validator();

function renderView(res: express.Response, form: CitizenDob): void {
  res.render('features/response/citizenDob/citizen-dob', {form: form});
}

function redirectToNextPage(req: express.Request, res: express.Response, dob: Date) {
  if (AgeEligibilityVerification.isOverEighteen(dob)) {
    res.redirect(constructResponseUrlWithIdParams(req.params.id, CITIZEN_PHONE_NUMBER_URL));
  } else {
    res.redirect(constructResponseUrlWithIdParams(req.params.id, AGE_ELIGIBILITY_URL));
  }
}

router.get(DOB_URL, async (req: express.Request, res: express.Response) => {
  try {
    const citizenDob = new CitizenDob();
    const responseDataRedis: Claim = await getCaseDataFromStore(req.params.id);
    if (responseDataRedis?.respondent1.dateOfBirth) {
      const dateOfBirth =  new Date(responseDataRedis.respondent1.dateOfBirth);
      citizenDob.day = dateOfBirth.getDate();
      citizenDob.month = (dateOfBirth.getMonth() + 1);
      citizenDob.year = dateOfBirth.getFullYear();
    }
    renderView(res, citizenDob);
  } catch (error) {
    logger.error(error);
    res.status(500).send({error: error.message});
  }
});

router.post(DOB_URL, async (req, res) => {
  const { year, month, day } = req.body;
  try {
    const citizenDob = new CitizenDob(year, month, day);
    citizenDob.errors = validator.validateSync(citizenDob);
    if (citizenDob?.errors.length > 0) {
      renderView(res, citizenDob);
    } else {
      const claim = await getCaseDataFromStore(req.params.id) || new Claim();
      if (claim.respondent1){
        claim.respondent1.dateOfBirth = citizenDob.dateOfBirth;
      } else {
        const respondent = new Respondent();
        respondent.dateOfBirth = citizenDob.dateOfBirth;
        claim.respondent1 = respondent;
      }
      await saveDraftClaim(req.params.id, claim);
      redirectToNextPage(req, res, claim.respondent1.dateOfBirth);
    }
  } catch (error) {
    logger.error(error);
    res.status(500).send({error: error.message});
  }
});

export default router;
