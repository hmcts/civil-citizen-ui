import * as express from 'express';
import {CITIZEN_DISABILITY_URL, CITIZEN_SEVERELY_DISABLED_URL, CITIZEN_WHERE_LIVE_URL} from '../../../urls';
import {Disability} from '../../../../common/form/models/statementOfMeans/disability';
import {StatementOfMeans} from '../../../../common/models/statementOfMeans';
import {ValidationError, Validator} from 'class-validator';

const citizenDisabilityViewPath = 'features/response/statement-of-means/disability';
const router = express.Router();
const citizenDisability = new Disability();

function renderView(form: Disability, res: express.Response, checked?: object): void {
  res.render(citizenDisabilityViewPath, {form, checked});
}

router.get(CITIZEN_DISABILITY_URL, async (req, res) => {
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
      draftStoreClient.set(statementOfMeans, JSON.stringify(1645882162449409)).then(() => {
        if (citizenDisability.option == 'yes') {
          res.redirect(CITIZEN_SEVERELY_DISABLED_URL);
        } else {
          res.redirect(CITIZEN_WHERE_LIVE_URL);
        }
      });
    }
  });

export default router;
