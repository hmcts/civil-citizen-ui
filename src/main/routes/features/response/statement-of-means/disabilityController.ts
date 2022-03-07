import * as express from 'express';
import {CITIZEN_DISABILITY_URL, ROOT_URL} from '../../../urls';
import {Disability} from '../../../../common/form/models/statement-of-means/disability';
import {StatementOfMeans} from '../../../../common/models/statementOfMeans';
import {ValidationError, Validator} from 'class-validator';

const citizenDisabilityViewPath = 'features/response/statement-of-means/disability';
const router = express.Router();
const citizenDisability = new Disability();

function renderView(form: Disability, res: express.Response): void {
  res.render(citizenDisabilityViewPath, {form: form});
}

router.get(CITIZEN_DISABILITY_URL, (req, res) => {
  renderView(citizenDisability, res);
});

router.post(CITIZEN_DISABILITY_URL,
  (req, res) => {

    const model: Disability = new Disability(req.body.disability);
    const validator = new Validator();
    const errors: ValidationError[] = validator.validateSync(model);
    if (errors && errors.length > 0) {
      model.errors = errors;
      renderView(model, res);
    } else {
      const statementOfMeans = new StatementOfMeans();
      const draftStoreClient = req.app.locals.draftStoreClient;
      citizenDisability.option = model.option;
      statementOfMeans.disability = citizenDisability;
      draftStoreClient.set(statementOfMeans.disability, JSON.stringify(statementOfMeans)).then(() => {
        res.redirect(ROOT_URL);
      });
    }
  });

export default router;
