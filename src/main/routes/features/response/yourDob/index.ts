import * as express from 'express';
import {CitizenDob} from '../../../../common/form/models/citizenDob';
import {Validator} from 'class-validator';
import {DOB_URL, ROOT_URL} from '../../../../routes/urls';
import {Respondent} from '../../../../common/models/respondent';
import {Claim} from '../../../../common/models/claim';

const router = express.Router();
let citizenDob = new CitizenDob();

function renderView (res: express.Response,form:CitizenDob): void {
  res.render('features/response/yourDob/your-dob', {form:form});
}

router.get(DOB_URL, (req: express.Request, res: express.Response) => {
  renderView(res, citizenDob);
});

router.post(DOB_URL,(req, res) => {

  citizenDob = new CitizenDob(req.body.year,req.body.month,req.body.day);
  const validator = new Validator();
  citizenDob.error = validator.validateSync(citizenDob);

  if (citizenDob.error && citizenDob.error.length > 0) {
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
