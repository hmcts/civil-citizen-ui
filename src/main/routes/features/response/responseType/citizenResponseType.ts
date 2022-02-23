import * as express from 'express';
import {CITIZEN_RESPONSE_TYPE, ROOT_URL} from '../../../urls';
import {ValidationError, Validator} from 'class-validator';
import {Respondent} from '../../../../common/models/respondent';
import {Claim} from '../../../../common/models/claim';
import {CitizenResponseType} from 'common/form/models/citizenResponseType';

const citizenResponseTypeViewPath = 'features/response/citizenResponseType/citizen-response-type';
const router = express.Router();
const citizenResponseType = new CitizenResponseType();
// eslint-disable-next-line no-sparse-arrays
const test = [{
  'title': 'Admit all of the claim',
  'content': 'You have until 4pm on {{ deadline }} to admit the claim.\', deadline = responseDeadline | date) '},
{
  'subtitle': 'Pay immediately',
  'content': 'If you admit all the claim and want to pay it in full, including interest and claim fee, contact the claimant to arrange payment.'},
{
  'title': 'title',
  'subtitle': 'subtitle'}];
function renderView(form: CitizenResponseType, res: express.Response): void {
  res.render(citizenResponseTypeViewPath, {form: form, test: test});
}

router.get(CITIZEN_RESPONSE_TYPE, (req, res) => {
  renderView(citizenResponseType, res);
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
      claim.legacyCaseReference = 'responseType';
      const draftStoreClient = req.app.locals.draftStoreClient;
      draftStoreClient.set(claim.legacyCaseReference, JSON.stringify(claim)).then(() => {
        res.redirect(ROOT_URL);
      });
    }
  });

export default router;
