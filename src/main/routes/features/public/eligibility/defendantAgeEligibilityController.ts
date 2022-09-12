import * as express from 'express';
import {
  ELIGIBILITY_DEFENDANT_AGE_URL,
  ELIGIBILITY_CLAIMANT_AGE_URL,
  NOT_ELIGIBLE_FOR_THIS_SERVICE_URL,
} from '../../../../routes/urls';
import {GenericForm} from '../../../../common/form/models/genericForm';

import {DefendantAgeEligibility} from '../../../../common/form/models/eligibility/defendant/DefendantAgeEligibility';
import {AgeEligibilityOptions} from '../../../../common/form/models/eligibility/defendant/AgeEligibilityOptions';
import {constructUrlWithNotEligibleReason} from '../../../../common/utils/urlFormatter';
import {NotEligibleReason} from '../../../../common/form/models/eligibility/NotEligibleReason';

const defendantAgeEligibilityController = express.Router();
const defendantEligibilityViewPath = 'features/public/eligibility/defendant-age';

function renderView(ageEligibilityForm: GenericForm<DefendantAgeEligibility>, res: express.Response): void {
  const form = Object.assign(ageEligibilityForm);
  res.render(defendantEligibilityViewPath, {form});
}

defendantAgeEligibilityController.get(ELIGIBILITY_DEFENDANT_AGE_URL, (req, res) => {
  const cookie = req.cookies['eligibility'] ? req.cookies['eligibility'] : {};
  const ageEligibility = cookie.eligibilityDefendantAge;
  const genericYesNoForm = new GenericForm(new DefendantAgeEligibility(ageEligibility));
  renderView(genericYesNoForm, res);
});

defendantAgeEligibilityController.post(ELIGIBILITY_DEFENDANT_AGE_URL, async (req, res) => {
  const form = new GenericForm(new DefendantAgeEligibility(req.body.option));
  await form.validate();

  if (form.hasErrors()) {
    renderView(form, res);
  } else {
    const cookie = req.cookies['eligibility'] ? req.cookies['eligibility'] : {};
    cookie.eligibilityDefendantAge = form.model.option;
    res.cookie('eligibility', cookie);
    form.model.option === AgeEligibilityOptions.NO
      ? res.redirect(constructUrlWithNotEligibleReason(NOT_ELIGIBLE_FOR_THIS_SERVICE_URL, NotEligibleReason.UNDER_18_DEFENDANT))
      : res.redirect(ELIGIBILITY_CLAIMANT_AGE_URL);
  }
});

export default defendantAgeEligibilityController;
