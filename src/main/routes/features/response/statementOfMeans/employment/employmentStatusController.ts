import * as express from 'express';
import {EmploymentForm} from '../../../../../common/form/models/statementOfMeans/employment/employmentForm';
import {EmploymentCategory} from '../../../../../common/form/models/statementOfMeans/employment/employmentCategory';
import {
  CITIZEN_EMPLOYMENT_URL,
  CITIZEN_SELF_EMPLOYED_URL,
  CITIZEN_WHO_EMPLOYS_YOU_URL,
  CITIZEN_UNEMPLOYED_URL,
} from '../../../../../routes/urls';
import {constructResponseUrlWithIdParams} from '../../../../../common/utils/urlFormatter';
import {
  getEmploymentForm,
  saveEmploymentData,
} from '../../../../../services/features/response/statementOfMeans/employment/employmentService';
import {GenericForm} from '../../../../../common/form/models/genericForm';

const citizenEmploymentStatusViewPath = 'features/response/statementOfMeans/employment/employment-status';
const employmentStatusController = express.Router();

function renderView(employmentForm: GenericForm<EmploymentForm>, res: express.Response): void {
  const form = Object.assign(employmentForm);
  form.option = employmentForm.model.option;
  res.render(citizenEmploymentStatusViewPath, {form, EmploymentCategory: EmploymentCategory});
}

function redirectToNextPage(form: GenericForm<EmploymentForm>, claimId: string, res: express.Response) {
  if (form.model.optionYesDefined()) {
    redirectToEmployersPage(form, claimId, res);
  } else {
    res.redirect(constructResponseUrlWithIdParams(claimId, CITIZEN_UNEMPLOYED_URL));
  }
}

function redirectToEmployersPage(form: GenericForm<EmploymentForm>, claimId: string, res: express.Response) {
  if (form.model.isSelfEmployed()) {
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
  const form = new GenericForm(new EmploymentForm(req.body.option, EmploymentForm.convertToArray(req.body.employmentCategory)));
  try {
    form.validateSync();
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
