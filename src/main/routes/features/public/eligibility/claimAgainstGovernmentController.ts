import {RequestHandler, Response, Router} from 'express';
import {
  ELIGIBILITY_DEFENDANT_AGE_URL,
  ELIGIBILITY_GOVERNMENT_DEPARTMENT_URL,
  NOT_ELIGIBLE_FOR_THIS_SERVICE_URL,
} from 'routes/urls';
import {GenericForm} from 'form/models/genericForm';
import {GenericYesNo} from 'form/models/genericYesNo';
import {YesNo} from 'form/models/yesNo';
import {constructUrlWithNotEligibleReason} from 'common/utils/urlFormatter';
import {NotEligibleReason} from 'form/models/eligibility/NotEligibleReason';

const claimAgainstGovernmentController = Router();
const defendantEligibilityViewPath = 'features/public/eligibility/claim-against-government';

function renderView(form: GenericForm<GenericYesNo>, res: Response): void {
  res.render(defendantEligibilityViewPath, {form});
}

claimAgainstGovernmentController.get(ELIGIBILITY_GOVERNMENT_DEPARTMENT_URL, (req, res) => {
  const cookie = req.cookies['eligibility'] ? req.cookies['eligibility'] : {};
  const governmentDepartment = cookie.governmentDepartment;
  const genericYesNoForm = new GenericForm(new GenericYesNo(governmentDepartment));
  renderView(genericYesNoForm, res);
});

claimAgainstGovernmentController.post(ELIGIBILITY_GOVERNMENT_DEPARTMENT_URL, (async (req, res) => {
  const genericYesNoForm = new GenericForm(new GenericYesNo(req.body.option));
  await genericYesNoForm.validate();

  if (genericYesNoForm.hasErrors()) {
    renderView(genericYesNoForm, res);
  } else {
    const cookie = req.cookies['eligibility'] ? req.cookies['eligibility'] : {};
    cookie.governmentDepartment = genericYesNoForm.model.option;
    res.cookie('eligibility', cookie);
    genericYesNoForm.model.option === YesNo.NO
      ? res.redirect(ELIGIBILITY_DEFENDANT_AGE_URL)
      : res.redirect(constructUrlWithNotEligibleReason(NOT_ELIGIBLE_FOR_THIS_SERVICE_URL, NotEligibleReason.GOVERNMENT_DEPARTMENT));
  }
}) as RequestHandler);

export default claimAgainstGovernmentController;
