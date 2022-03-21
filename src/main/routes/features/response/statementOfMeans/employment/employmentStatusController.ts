import * as express from 'express';
import {EmploymentForm} from '../../../../../common/form/models/statementOfMeans/employment/employmentForm';
import {EmploymentCategory} from '../../../../../common/form/models/statementOfMeans/employment/employmentCategory';
import {
  CITIZEN_EMPLOYMENT_URL,
  SELF_EMPLOYED_URL,
  UNEMPLOYED_URL,
  WHO_EMPLOYS_YOU_URL,
} from '../../../../../routes/urls';
import {validateForm} from '../../../../../common/form/validators/formValidator';
import {constructResponseUrlWithIdParams} from '../../../../../common/utils/urlFormatter';
import {
  getEmploymentForm,
  saveEmploymentData,
} from '../../../../../modules/statementOfMeans/employment/employmentService';

const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('cohabitingService');
const citizenEmploymentStatusViewPath = 'features/response/statementOfMeans/employment/employment-status';
const router = express.Router();

function renderView(form: EmploymentForm, res: express.Response): void {
  res.render(citizenEmploymentStatusViewPath, {form: form, EmploymentCategory: EmploymentCategory});
}

function redirectToNextPage(form: EmploymentForm, claimId: string, res: express.Response) {
  if (form.optionYesDefined()) {
    redirectToEmployersPage(form, claimId, res);
  } else {
    res.redirect(constructResponseUrlWithIdParams(claimId, UNEMPLOYED_URL));
  }
}

function redirectToEmployersPage(form: EmploymentForm, claimId: string, res: express.Response) {
  if (form.isSelfEmployed()) {
    res.redirect(constructResponseUrlWithIdParams(claimId, SELF_EMPLOYED_URL));
  } else {
    res.redirect(constructResponseUrlWithIdParams(claimId, WHO_EMPLOYS_YOU_URL));
  }
}

router.get(CITIZEN_EMPLOYMENT_URL, async (req, res) => {
  try {
    const form = await getEmploymentForm(req.params.id);
    renderView(form, res);
  } catch (error) {
    logger.error(`${(error as Error).stack || error}`);
  }
});

router.post(CITIZEN_EMPLOYMENT_URL, async (req, res) => {
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
    logger.error(`${(error as Error).stack || error}`);
  }
});

export default router;
