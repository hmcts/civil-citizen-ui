import * as express from 'express';
import {
  ELIGIBILITY_GOVERNMENT_DEPARTMENT_URL,
  ELIGIBILITY_DEFENDANT_AGE_URL,
  NOT_ELIGIBLE_FOR_THIS_SERVICE_URL,
} from '../../../../routes/urls';
import {GenericForm} from '../../../../common/form/models/genericForm';
import {GenericYesNo} from '../../../../common/form/models/genericYesNo';
import {YesNo} from '../../../../common/form/models/yesNo';

const claimAgainstGovernmentController = express.Router();
const defendantEligibilityViewPath = 'features/public/eligibility/claim-against-government';

function renderView(genericYesNoForm: GenericForm<GenericYesNo>, res: express.Response): void {
  const form = Object.assign(genericYesNoForm);
  form.option = genericYesNoForm.model.option;
  res.render(defendantEligibilityViewPath, {form});
}

claimAgainstGovernmentController.get(ELIGIBILITY_GOVERNMENT_DEPARTMENT_URL, (req, res) => {
  const cookie = req.cookies['eligibility'] ? req.cookies['eligibility'] : {};
  const governmentDepartment = cookie.governmentDepartment;
  const genericYesNoForm = new GenericForm(new GenericYesNo(governmentDepartment));
  renderView(genericYesNoForm, res);
});

claimAgainstGovernmentController.post(ELIGIBILITY_GOVERNMENT_DEPARTMENT_URL, (req, res) => {
  const genericYesNoForm = new GenericForm(new GenericYesNo(req.body.option));
  genericYesNoForm.validateSync();

  if (genericYesNoForm.hasErrors()) {
    renderView(genericYesNoForm, res);
  } else {
    const cookie = req.cookies['eligibility'] ? req.cookies['eligibility'] : {};
    cookie.governmentDepartment = genericYesNoForm.model.option;
    res.cookie('eligibility', cookie);
    genericYesNoForm.model.option === YesNo.NO
      ? res.redirect(ELIGIBILITY_DEFENDANT_AGE_URL)
      : res.redirect(NOT_ELIGIBLE_FOR_THIS_SERVICE_URL + '?reason=government-department');
  }
});

export default claimAgainstGovernmentController;
