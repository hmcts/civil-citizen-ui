import * as express from 'express';
import {CitizenTelephoneNumber} from '../../../../common/form/models/citizenTelephoneNumber';
import {CITIZEN_PHONE_NUMBER_URL, ROOT_URL} from '../../../urls';
import {ValidationError, Validator} from 'class-validator';
import {Respondent} from '../../../../common/models/respondent';
import {Claim} from '../../../../common/models/claim';

const citizenPhoneViewPath = 'features/response/citizenPhoneNumber/citizen-phone';
const router = express.Router();
const citizenTelephoneNumber = new CitizenTelephoneNumber();

function renderView(form: CitizenTelephoneNumber, res: express.Response): void {
  res.render(citizenPhoneViewPath, {form: form});
}

router.get(CITIZEN_PHONE_NUMBER_URL, (req, res) => {
  renderView(citizenTelephoneNumber, res);
});
router.post(CITIZEN_PHONE_NUMBER_URL,
  (req, res) => {
    const model: CitizenTelephoneNumber = new CitizenTelephoneNumber(req.body.telephoneNumber);
    const validator = new Validator();
    const errors: ValidationError[] = validator.validateSync(model);
    if (errors && errors.length > 0) {
      model.errors = errors;
      renderView(model, res);
    } else {
      const respondent = new Respondent();
      respondent.telephoneNumber = model.telephoneNumber;
      const claim = new Claim();
      claim.respondent1 = respondent;
      claim.legacyCaseReference = 'phone-number';
      const draftStoreClient = req.app.locals.draftStoreClient;
      draftStoreClient.set(claim.legacyCaseReference, JSON.stringify(claim)).then(() => {
        res.redirect(ROOT_URL);
      });
    }
  });

export default router;
