import * as express from 'express';
import {CITIZEN_DISABILITY_URL, CITIZEN_SEVERELY_DISABLED_URL, CITIZEN_WHERE_LIVE_URL} from '../../../urls';
import {Disability} from '../../../../common/form/models/statementOfMeans/disability';
import {ValidationError, Validator} from 'class-validator';
import {DisabilityService} from '../../../../modules/statementOfMeans/disabilityService';

const citizenDisabilityViewPath = 'features/response/statement-of-means/disability';
const router = express.Router();
const disability = new Disability();

const disabilityService = new DisabilityService();

function renderView(form: Disability, res: express.Response, checked?: object): void {
  res.render(citizenDisabilityViewPath, {form, checked});
}

router.get(CITIZEN_DISABILITY_URL, async (req: any, res) => {
  console.log(req.params.id);
  disabilityService.getDisability(req.params.id).then(() => {
    renderView(disability, res);
  });
});

router.post(CITIZEN_DISABILITY_URL,
  (req: any, res) => {
    const model: Disability = new Disability(req.body.disability);
    const validator = new Validator();
    const errors: ValidationError[] = validator.validateSync(model);
    if (errors && errors.length > 0) {
      model.errors = errors;
      renderView(model, res);
    } else {
      disability.option = model.option;
      disabilityService.saveDisability(req.params.id, disability);
      if (disability.option == 'yes') {
        res.redirect(CITIZEN_SEVERELY_DISABLED_URL);
      } else {
        res.redirect(CITIZEN_WHERE_LIVE_URL);
      }
    }
  });

export default router;
