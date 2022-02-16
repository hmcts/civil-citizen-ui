import * as express from 'express';
import {CitizenTelephoneNumber} from '../../../../common/form/models/citizenTelephoneNumber';
import {CITIZEN_PHONE_NUMBER_URL} from '../../../urls';
import {ValidationError, Validator} from 'class-validator';
import {Respondent} from '../../../../common/models/respondent';
import {Claim} from '../../../../common/models/claim';

const citizenPhoneViewPath = 'features/response/phone-details/citizen-phone';
const router = express.Router();
const defendantDetailsTelephoneNumber = new CitizenTelephoneNumber();

function renderView(form: CitizenTelephoneNumber, res: express.Response): void {
  res.render(citizenPhoneViewPath, {form: form});
}

router.get(CITIZEN_PHONE_NUMBER_URL, (req, res) => {
  renderView(defendantDetailsTelephoneNumber, res);
});
router.post(CITIZEN_PHONE_NUMBER_URL,
  (req, res) => {
    const model: CitizenTelephoneNumber = Object.assign(new CitizenTelephoneNumber(), req.body);
    const validator = new Validator();
    const errors: ValidationError[] = validator.validateSync(model);
    if (errors && errors.length > 0) {
      model.error = errors[0];
      renderView(model, res);
    }else {
      const respondent = new Respondent();
      respondent.telephoneNumber = model.telephoneNumber;
      const claim = new Claim();
      claim.respondent = respondent;
      claim.legacyCaseReference = 'phone-number';
      const draftStoreClient = req.app.locals.draftStoreClient;
      draftStoreClient.set(claim.legacyCaseReference, JSON.stringify(claim)).then(()=> {
        renderView(model, res);
      });
    }
  });

export default router;
