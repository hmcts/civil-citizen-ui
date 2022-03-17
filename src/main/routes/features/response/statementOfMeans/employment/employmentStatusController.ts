import * as express from 'express';
import {EmploymentStatus} from '../../../../../common/form/models/statementOfMeans/employment/employmentStatus';
import {EmploymentCategory} from '../../../../../common/form/models/statementOfMeans/employment/employmentCategory';
import {CITIZEN_EMPLOYMENT_URL} from '../../../../../routes/urls';
import {validateForm} from '../../../../../common/form/validators/formValidator';

const citizenEmploymentStatusViewPath = 'features/response/statementOfMeans/employment/employment_status';
const router = express.Router();

function renderView(form: EmploymentStatus, res: express.Response): void {
  res.render(citizenEmploymentStatusViewPath, {form: form, EmploymentCategory: EmploymentCategory});
}

router.get(CITIZEN_EMPLOYMENT_URL, (req, res) => {
  const form = new EmploymentStatus();
  renderView(form, res);
});

router.post(CITIZEN_EMPLOYMENT_URL, async (req, res) => {
  console.log(req.body);
  const form = new EmploymentStatus(req.body.option, req.body.employmentCategory);
  console.log(form);
  await validateForm(form);
  if (form.hasErrors()) {
    renderView(form, res);
  }
});

export default router;
