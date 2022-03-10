import * as express from 'express';
import {CitizenTelephoneNumber} from '../../../../common/form/models/citizenTelephoneNumber';
import {CITIZEN_PHONE_NUMBER_URL, DASHBOARD_URL} from '../../../urls';
import {ValidationError, Validator} from 'class-validator';
import {Respondent} from '../../../../common/models/respondent';
import {Claim} from '../../../../common/models/claim';
import {Form} from '../../../../common/form/models/form';

const citizenPhoneViewPath = 'features/response/citizenPhoneNumber/citizen-phone';
const router = express.Router();
const citizenTelephoneNumber = new Form(new CitizenTelephoneNumber());

function renderView(form: Form<CitizenTelephoneNumber>, res: express.Response): void {
  res.render(citizenPhoneViewPath, {form: form});
}

router.get(CITIZEN_PHONE_NUMBER_URL, (req, res) => {
  renderView(citizenTelephoneNumber, res);
});
router.post(CITIZEN_PHONE_NUMBER_URL,
  (req, res) => {
    const form: Form<CitizenTelephoneNumber> = new Form(new CitizenTelephoneNumber(req.body.telephoneNumber));
    const validator = new Validator();
    const errors: ValidationError[] = validator.validateSync(form.model);
    if (errors && errors.length > 0) {
      form.errors = errors;
      renderView(form, res);
    } else {
      const respondent = new Respondent();
      respondent.telephoneNumber = form.model.telephoneNumber;
      const claim = new Claim();
      claim.respondent1 = respondent;
      claim.legacyCaseReference = 'phone-number';
      const draftStoreClient = req.app.locals.draftStoreClient;
      draftStoreClient.set(claim.legacyCaseReference, JSON.stringify(claim)).then(() => {
        res.redirect(DASHBOARD_URL);
      });
    }
  });

export default router;
