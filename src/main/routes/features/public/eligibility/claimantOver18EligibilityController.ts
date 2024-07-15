import {Response, Router} from 'express';
import {
  NOT_ELIGIBLE_FOR_THIS_SERVICE_URL,
  ELIGIBILITY_CLAIMANT_AGE_URL,
  ELIGIBILITY_HELP_WITH_FEES_URL,
} from '../../../../routes/urls';
import {GenericForm} from '../../../../common/form/models/genericForm';
import {GenericYesNo} from '../../../../common/form/models/genericYesNo';
import {YesNo} from '../../../../common/form/models/yesNo';
import {constructUrlWithNotEligibleReason} from '../../../../common/utils/urlFormatter';
import {NotEligibleReason} from '../../../../common/form/models/eligibility/NotEligibleReason';

const claimantOver18EligibilityController = Router();
const over18EligibilityViewPath = 'features/public/eligibility/over-18';

function renderView(form: GenericForm<GenericYesNo>, res: Response): void {
  res.render(over18EligibilityViewPath, {form});
}

claimantOver18EligibilityController.get(ELIGIBILITY_CLAIMANT_AGE_URL, (req, res) => {
  const cookie = req.cookies['eligibility'] ? req.cookies['eligibility'] : {};
  const claimantOver18 = cookie.claimantOver18;
  const genericYesNoForm = new GenericForm(new GenericYesNo(claimantOver18));
  renderView(genericYesNoForm, res);
});

claimantOver18EligibilityController.post(ELIGIBILITY_CLAIMANT_AGE_URL, (req, res) => {
  const genericYesNoForm = new GenericForm(new GenericYesNo(req.body.option, 'ERRORS.VALID_YES_NO_OPTION_VARIATION_2'));
  genericYesNoForm.validateSync();

  if (genericYesNoForm.hasErrors()) {
    renderView(genericYesNoForm, res);
  } else {
    const cookie = req.cookies['eligibility'] ? req.cookies['eligibility'] : {};
    cookie.claimantOver18 = genericYesNoForm.model.option;
    res.cookie('eligibility', cookie);
    genericYesNoForm.model.option === YesNo.YES
      ? res.redirect(ELIGIBILITY_HELP_WITH_FEES_URL)
      : res.redirect(constructUrlWithNotEligibleReason(NOT_ELIGIBLE_FOR_THIS_SERVICE_URL, NotEligibleReason.UNDER_18_CLAIMANT));
  }
});

export default claimantOver18EligibilityController;
