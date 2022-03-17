import * as express from 'express';
import {EmploymentStatus} from '../../../../../common/form/models/statementOfMeans/employment/employmentStatus';
import {EmploymentCategory} from '../../../../../common/form/models/statementOfMeans/employment/employmentCategory';
import {
  CITIZEN_EMPLOYMENT_URL,
  SELF_EMPLOYED_URL,
  UNEMPLOYED_URL,
  WHO_EMPLOYS_YOU_URL,
} from '../../../../../routes/urls';
import {validateForm} from '../../../../../common/form/validators/formValidator';
import {YesNo} from '../../../../../common/form/models/yesNo';
import {constructResponseUrlWithIdParams} from '../../../../../common/utils/urlFormatter';

const citizenEmploymentStatusViewPath = 'features/response/statementOfMeans/employment/employment_status';
const router = express.Router();

function renderView(form: EmploymentStatus, res: express.Response): void {
  res.render(citizenEmploymentStatusViewPath, {form: form, EmploymentCategory: EmploymentCategory});
}

function redirectToNextPage(form: EmploymentStatus, claimId: string, res: express.Response) {
  if (form.option === YesNo.YES) {
    redirectToEmployersPage(form.employmentCategory, claimId, res);
  } else {
    res.redirect(constructResponseUrlWithIdParams(claimId, UNEMPLOYED_URL));
  }
}

function redirectToEmployersPage(employmentCategory: EmploymentCategory[], claimId: string, res: express.Response) {
  if (employmentCategory.length == 1 && employmentCategory[0] === EmploymentCategory.SELF_EMPLOYED) {
    res.redirect(constructResponseUrlWithIdParams(claimId, SELF_EMPLOYED_URL));
  } else {
    res.redirect(constructResponseUrlWithIdParams(claimId, WHO_EMPLOYS_YOU_URL));
  }
}

router.get(CITIZEN_EMPLOYMENT_URL, (req, res) => {
  const form = new EmploymentStatus();
  renderView(form, res);
});

router.post(CITIZEN_EMPLOYMENT_URL, async (req, res) => {
  const form = new EmploymentStatus(req.body.option, EmploymentStatus.convertToArray(req.body.employmentCategory));
  await validateForm(form);
  if (form.hasErrors()) {
    renderView(form, res);
  } else {
    redirectToNextPage(form, req.params.id, res);
  }
});

export default router;
