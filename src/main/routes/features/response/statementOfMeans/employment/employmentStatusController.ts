import * as express from 'express';
import {EmploymentForm} from '../../../../../common/form/models/statementOfMeans/employment/employmentForm';
import {EmploymentCategory} from '../../../../../common/form/models/statementOfMeans/employment/employmentCategory';
import {
  CITIZEN_EMPLOYMENT_URL,
  CITIZEN_SELF_EMPLOYED_URL,
  CITIZEN_WHO_EMPLOYS_YOU_URL,
  CITIZEN_UNEMPLOYED_URL,
} from '../../../../../routes/urls';
import {validateForm} from '../../../../../common/form/validators/formValidator';
import {constructResponseUrlWithIdParams} from '../../../../../common/utils/urlFormatter';
import {
  getEmploymentForm,
  saveEmploymentData,
} from '../../../../../services/features/response/statementOfMeans/employment/employmentService';

const citizenEmploymentStatusViewPath = 'features/response/statementOfMeans/employment/employment-status';
const employmentStatusController = express.Router();

function renderView(form: EmploymentForm, res: express.Response): void {
  res.render(citizenEmploymentStatusViewPath, {form: form, EmploymentCategory: EmploymentCategory});
}

function redirectToNextPage(form: EmploymentForm, claimId: string, res: express.Response) {
  if (form.optionYesDefined()) {
    redirectToEmployersPage(form, claimId, res);
  } else {
    res.redirect(constructResponseUrlWithIdParams(claimId, CITIZEN_UNEMPLOYED_URL));
  }
}

function redirectToEmployersPage(form: EmploymentForm, claimId: string, res: express.Response) {
  if (form.isSelfEmployed()) {
    res.redirect(constructResponseUrlWithIdParams(claimId, CITIZEN_SELF_EMPLOYED_URL));
  } else {
    res.redirect(constructResponseUrlWithIdParams(claimId, CITIZEN_WHO_EMPLOYS_YOU_URL));
  }
}

employmentStatusController.get(CITIZEN_EMPLOYMENT_URL, async (req, res, next: express.NextFunction) => {
  try {
    const form = await getEmploymentForm(req.params.id);
    renderView(form, res);
  } catch (error) {
    next(error);
  }
});

employmentStatusController.post(CITIZEN_EMPLOYMENT_URL, async (req, res, next: express.NextFunction) => {
  const form = new EmploymentForm(req.body.option, EmploymentForm.convertToArray(req.body.employmentCategory));
  try {
    await validateForm(form);
    if (form.hasErrors()) {
      renderView(form, res);
    } else {
      await saveEmploymentData(req.params.id, form);
      redirectToNextPage(form, req.params.id, res);
    }
  } catch (error) {
    next(error);
  }
});

export default employmentStatusController;
