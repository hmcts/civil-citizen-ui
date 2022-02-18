import * as express from 'express';
import {CitizenDob} from '../../../../common/form/models/citizenDob';
import {Validator} from 'class-validator';
import {DOB_URL, ROOT_URL} from '../../../../routes/urls';
import {Respondent} from '../../../../common/models/respondent';
import {Claim} from '../../../../common/models/claim';

const router = express.Router();


function renderView (res: express.Response,form:CitizenDob): void {
  res.render('features/response/yourDob/your-dob', {form:form});
}

router.get(DOB_URL, (req: express.Request, res: express.Response) => {
  const citizenDob = new CitizenDob();
  renderView(res, citizenDob);
});

router.post(DOB_URL,(req, res) => {
  const citizenDob = new CitizenDob(req.body.year,req.body.month,req.body.day);
  const validator = new Validator();
  citizenDob.errors = validator.validateSync(citizenDob);

  if (citizenDob.errors && citizenDob.errors.length > 0) {
    renderView(res, citizenDob);
  } else {
    const respondent = new Respondent();
    respondent.dateOfBirth = citizenDob.dateOfBirth;
    const claim = new Claim();
    claim.respondent1 = respondent;
    claim.legacyCaseReference = 'dob';
    const draftStoreClient = req.app.locals.draftStoreClient;
    draftStoreClient.set(claim.legacyCaseReference, JSON.stringify(claim)).then(() => {
      res.redirect(ROOT_URL);
    });
  }
});

export default router;
