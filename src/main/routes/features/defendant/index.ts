import * as express from 'express';
import {CitizenTelephoneNumber} from '../../../common/form/models/citizenTelephoneNumber';

import {ValidationError, Validator} from 'class-validator';

const router = express.Router();
const defendantDetailsTelephoneNumber = new CitizenTelephoneNumber();

function renderView(form: CitizenTelephoneNumber, res: express.Response): void {
  res.render('features/defendant/citizen-phone', {form: form});
}

router.get('/citizen-phone', (req, res) => {
  renderView(defendantDetailsTelephoneNumber, res);
});
router.post('/citizen-phone',
  (req, res) => {
    const model: CitizenTelephoneNumber = Object.assign(new CitizenTelephoneNumber(), req.body);
    const validator = new Validator();
    const errors: ValidationError[] = validator.validateSync(model);
    if (errors && errors.length > 0) {
      model.error = errors[0];
      console.log(model.getErrorMessage());
    }
    //temporary outside the if statement to show there are no errors.
    renderView(model, res);
  });

export default router;
