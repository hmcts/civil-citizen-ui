import * as express from 'express';
import {DefendantDetailsTelephoneNumber} from '../../../common/form/models/defendantDetailsTelephoneNumber';
import {Form} from '../../../common/form/form';
//import {FormValidator} from '../../../common/form/validation/formValidator';
import {ValidationError, Validator} from 'class-validator';

const router = express.Router();
const defendantDetailsTelephoneNumber = new DefendantDetailsTelephoneNumber();

function renderView(form: Form<DefendantDetailsTelephoneNumber>, res: express.Response): void {
  res.render('features/defendant/citizen-phone', {form: form});
}

router.get('/citizen-phone', (req, res) => {
  renderView(new Form<DefendantDetailsTelephoneNumber>(defendantDetailsTelephoneNumber), res);
});
router.post('/citizen-phone',
  (req, res) => {
    const form: Form<DefendantDetailsTelephoneNumber> = new Form<DefendantDetailsTelephoneNumber>(Object.assign(new DefendantDetailsTelephoneNumber(), req.body));
    const model: DefendantDetailsTelephoneNumber = form.model;
    const validator = new Validator();
    const errors: ValidationError[] = validator.validateSync(model);
    if(errors && errors.length>0){
      const formWithErrors = new Form<DefendantDetailsTelephoneNumber>(model, errors);
      renderView(formWithErrors, res);
    }
  });

export default router;
