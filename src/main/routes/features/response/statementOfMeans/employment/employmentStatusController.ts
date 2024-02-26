import {NextFunction, RequestHandler, Response, Router} from 'express';
import {EmploymentForm} from 'form/models/statementOfMeans/employment/employmentForm';
import {EmploymentCategory} from 'form/models/statementOfMeans/employment/employmentCategory';
import {
  CITIZEN_EMPLOYMENT_URL,
  CITIZEN_SELF_EMPLOYED_URL,
  CITIZEN_WHO_EMPLOYS_YOU_URL,
  CITIZEN_UNEMPLOYED_URL,
} from 'routes/urls';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {
  getEmploymentForm,
  saveEmploymentData,
} from 'services/features/response/statementOfMeans/employment/employmentService';
import {GenericForm} from 'form/models/genericForm';
import {AppRequest} from 'common/models/AppRequest';
import {generateRedisKey} from 'modules/draft-store/draftStoreService';

const citizenEmploymentStatusViewPath = 'features/response/statementOfMeans/employment/employment-status';
const employmentStatusController = Router();

function renderView(form: GenericForm<EmploymentForm>, res: Response): void {
  res.render(citizenEmploymentStatusViewPath, {form, EmploymentCategory: EmploymentCategory});
}

function redirectToNextPage(form: GenericForm<EmploymentForm>, claimId: string, res: Response) {
  if (form.model.optionYesDefined()) {
    redirectToEmployersPage(form, claimId, res);
  } else {
    res.redirect(constructResponseUrlWithIdParams(claimId, CITIZEN_UNEMPLOYED_URL));
  }
}

function redirectToEmployersPage(form: GenericForm<EmploymentForm>, claimId: string, res: Response) {
  if (form.model.isSelfEmployed()) {
    res.redirect(constructResponseUrlWithIdParams(claimId, CITIZEN_SELF_EMPLOYED_URL));
  } else {
    res.redirect(constructResponseUrlWithIdParams(claimId, CITIZEN_WHO_EMPLOYS_YOU_URL));
  }
}

employmentStatusController.get(CITIZEN_EMPLOYMENT_URL, (async (req, res, next: NextFunction) => {
  try {
    const form = await getEmploymentForm(generateRedisKey(<AppRequest>req));
    renderView(form, res);
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

employmentStatusController.post(CITIZEN_EMPLOYMENT_URL, (async (req, res, next: NextFunction) => {
  const form = new GenericForm(new EmploymentForm(req.body.option, EmploymentForm.convertToArray(req.body.employmentCategory)));
  try {
    form.validateSync();
    if (form.hasErrors()) {
      renderView(form, res);
    } else {
      await saveEmploymentData(generateRedisKey(<AppRequest>req), form);
      redirectToNextPage(form, req.params.id, res);
    }
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

export default employmentStatusController;
