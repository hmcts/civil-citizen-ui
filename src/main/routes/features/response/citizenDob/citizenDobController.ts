import * as express from 'express';
import {CitizenDob} from '../../../../common/form/models/citizenDob';
import {ValidationError, Validator} from 'class-validator';
import {DOB_URL, DASHBOARD_URL, AGE_ELIGIBILITY_URL} from '../../../../routes/urls';
import {Respondent} from '../../../../common/models/respondent';
import {Claim} from '../../../../common/models/claim';
import {AgeEligibilityVerification} from '../../../../common/utils/ageEligibilityVerification';
import {Form} from '../../../../common/form/models/form';


const router = express.Router();
function renderView(res: express.Response, form: Form<CitizenDob>): void {
  res.render('features/response/citizenDob/citizen-dob', {form: form});
}

function redirectToNextPage(req: express.Request, res: express.Response, dob: Date) {
  if (AgeEligibilityVerification.isOverEighteen(dob)) {
    res.redirect(DASHBOARD_URL);
  } else {
    res.redirect(AGE_ELIGIBILITY_URL);
  }
}

router.get(DOB_URL, (req: express.Request, res: express.Response) => {
  const citizenDobForm: Form<CitizenDob> = new Form(new CitizenDob());
  renderView(res, citizenDobForm);
});

router.post(DOB_URL, (req, res) => {
  const citizenDobForm: Form<CitizenDob> = new Form(new CitizenDob(req.body.year, req.body.month, req.body.day));
  const validator = new Validator();
  const errors: ValidationError[] = validator.validateSync(citizenDobForm.model);

  if (errors && errors.length > 0) {
    citizenDobForm.errors = errors;
    renderView(res, citizenDobForm);
  } else {
    const respondent = new Respondent();
    respondent.dateOfBirth = citizenDobForm.model.dateOfBirth;
    const claim = new Claim();
    claim.respondent1 = respondent;
    claim.legacyCaseReference = 'dob';
    const draftStoreClient = req.app.locals.draftStoreClient;
    draftStoreClient.set(claim.legacyCaseReference, JSON.stringify(claim)).then(() => {
      redirectToNextPage(req, res, respondent.dateOfBirth);
    });
  }
});

export default router;
