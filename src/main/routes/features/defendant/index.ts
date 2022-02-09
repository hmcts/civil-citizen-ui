import * as express from 'express';
import {DefendendDetailsTelephoneNumber} from '../../../common/form/models/defendendDetailsTelephoneNumber';
import {Form} from '../../../common/form/form';
//import {FormValidator} from '../../../common/form/validation/formValidator';
import {ValidationError, Validator, isNumberString} from 'class-validator';

const router = express.Router();
const defendantDetailsTelephoneNumber = new DefendendDetailsTelephoneNumber();

function renderView(form: Form<DefendendDetailsTelephoneNumber>, res: express.Response): void {
  res.render('features/defendant/citizen-phone', {form: form});
}

router.get('/citizen-phone', (req, res) => {
  renderView(new Form<DefendendDetailsTelephoneNumber>(defendantDetailsTelephoneNumber), res);
});
router.post('/citizen-phone',
  (req, res) => {
    const form: Form<DefendendDetailsTelephoneNumber> = new Form<DefendendDetailsTelephoneNumber>(Object.assign(new DefendendDetailsTelephoneNumber(), req.body));
    const model: DefendendDetailsTelephoneNumber = form.model;
    console.log(form);
    console.log(model);
    const validator = new Validator();
    console.log(model.telephoneNumber);
    console.log(isNumberString(model.telephoneNumber));
    if (model.telephoneNumber && !isNumberString(model.telephoneNumber)) {
      const errors: ValidationError[] = validator.validateSync(model);
      const formWithErrors = new Form<DefendendDetailsTelephoneNumber>(model, errors);
      renderView(formWithErrors, res);
    }

  });

export default router;
