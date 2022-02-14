import * as express from 'express';
import {CitizenTelephoneNumber} from '../../../../common/form/models/citizenTelephoneNumber';
import {CITIZEN_PHONE_NUMBER_URL} from '../../../urls';
import {ValidationError, Validator} from 'class-validator';

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
    }
    //temporary outside the if statement to show there are no errors.
    //TODO: put back inside the if statement and add next()
    renderView(model, res);
  });

export default router;
