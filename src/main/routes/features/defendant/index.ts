import * as express from 'express';
import {DefendendDetailsTelephoneNumber} from '../../../common/form/models/defendendDetailsTelephoneNumber';
import {Form} from '../../../common/form/form';
import {FormValidator} from '../../../common/form/validation/formValidator';

const router = express.Router();
const defendantDetailsTelephoneNumber = new DefendendDetailsTelephoneNumber();

function renderView(form: Form<DefendendDetailsTelephoneNumber>, res: express.Response): void {
  res.render('features/defendant/citizen-phone',{form:form});
}

router.get('/citizen-phone', (req, res) => {
  renderView(new Form<DefendendDetailsTelephoneNumber>(defendantDetailsTelephoneNumber), res);
});
router.post('/citizen-phone', FormValidator.requestHandler(DefendendDetailsTelephoneNumber),
  (req, res) => {
    const form: Form<DefendendDetailsTelephoneNumber> = req.body;

    if (form.hasErrors()) {
      renderView(form, res);
      console.log(form);
    }
  });

export default router;
