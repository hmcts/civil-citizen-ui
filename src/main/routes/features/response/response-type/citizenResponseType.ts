import * as express from 'express';
import {CitizenTelephoneNumber} from '../../../../common/form/models/citizenTelephoneNumber';
import {CITIZEN_RESPONSE_TYPE, ROOT_URL} from '../../../urls';
import {ValidationError, Validator} from 'class-validator';
import {Respondent} from '../../../../common/models/respondent';
import {Claim} from '../../../../common/models/claim';
import {CitizenResponseType} from 'common/form/models/citizenResponseType';

const citizenResponseType = 'features/response/citizenResponseType/citizen-response-type';
const router = express.Router();
const citizenTelephoneNumber = new CitizenTelephoneNumber();

function renderView(form: CitizenTelephoneNumber, res: express.Response): void {
  res.render(citizenResponseType, {form: form});
}

router.get(CITIZEN_RESPONSE_TYPE, (req, res) => {
  renderView(citizenTelephoneNumber, res);
});
router.post(CITIZEN_RESPONSE_TYPE,
  (req, res) => {
    const model: CitizenResponseType = new CitizenResponseType(req.body.responsetype);
    const validator = new Validator();
    const errors: ValidationError[] = validator.validateSync(model);
    if (errors && errors.length > 0) {
      model.errors = errors;
      renderView(model, res);
    } else {
      const respondent = new Respondent();
      respondent.responseType = model.responseType;
      const claim = new Claim();
      claim.respondent1 = respondent;
      claim.legacyCaseReference = 'response-type';
      const draftStoreClient = req.app.locals.draftStoreClient;
      draftStoreClient.set(claim.legacyCaseReference, JSON.stringify(claim)).then(() => {
        res.redirect(ROOT_URL);
      });
    }
  });

export default router;
