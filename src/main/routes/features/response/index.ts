import * as express from 'express';
import {DefendantDetailsDob} from '../../../common/form/models/defendantDetailsDob';
import {Form} from '../../../common/form/form';
import {ValidationError, Validator} from 'class-validator';

const router = express.Router();
const defendantDetailsDob = new DefendantDetailsDob();

function renderView (form: Form<DefendantDetailsDob>, res: express.Response): void {
  res.render('features/response/your-dob', {form: form});
}
/* tslint:disable:no-default-export */
router.get('/your-dob', (req: express.Request, res: express.Response) => {
  renderView(new Form<DefendantDetailsDob>(defendantDetailsDob), res);
});

router.post('/your-dob',
  (req, res) => {
    const form: Form<DefendantDetailsDob> = new Form<DefendantDetailsDob>(Object.assign(new DefendantDetailsDob(), req.body));
    const model: DefendantDetailsDob = form.model;
    const validator = new Validator();
    const errors: ValidationError[] = validator.validateSync(model);
    if (errors && errors.length > 0){
      const formWithErrors = new Form<DefendantDetailsDob>(model, errors);
      renderView(formWithErrors, res);
    } else {
      // temporary to show error removed, should forward to next page in sequence
      renderView(form, res);
    }
  });

export default router;
