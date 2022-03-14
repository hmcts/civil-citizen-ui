import * as express from 'express';
import {CITIZEN_RESIDENCE_URL, CITIZEN_SEVERELY_DISABLED_URL} from '../../../urls';
import {Disability} from '../../../../common/form/models/statementOfMeans/disability';
import {ValidationError, Validator} from 'class-validator';
import {SevereDisabilityService} from '../../../../modules/statementOfMeans/severeDisabilityService';

const citizenDisabilityViewPath = 'features/response/statement-of-means/disability';
const router = express.Router();
const severeDisability = new Disability();
const severeDisabilityService = new SevereDisabilityService();

function renderView(form: Disability, res: express.Response): void {
  res.render(citizenDisabilityViewPath, {form});
}

router.get(CITIZEN_SEVERELY_DISABLED_URL.toString(), async (req, res) => {
  severeDisabilityService.getSevereDisability(req.params.id).then(() => {
    renderView(severeDisability, res);
  });
});

router.post(CITIZEN_SEVERELY_DISABLED_URL.toString(),
  (req, res) => {
    const severeDisability: Disability = new Disability(req.body.disability);
    const validator = new Validator();
    const errors: ValidationError[] = validator.validateSync(severeDisability);
    if (errors && errors.length > 0) {
      severeDisability.errors = errors;
      renderView(severeDisability, res);
    } else {
      severeDisabilityService.saveSevereDisability(req.params.id, severeDisability);
      res.redirect(CITIZEN_RESIDENCE_URL);
    }
  });

export default router;
