import * as express from 'express';
import {
  NOT_ELIGIBLE_FOR_THIS_SERVICE_URL,
  ELIGIBILITY_HELP_WITH_FEES_URL,
  ELIGIBILITY_INFORMATION_ABOUT_HELP_WITH_FEES_URL,
} from '../../../../routes/urls';
import {GenericForm} from '../../../../common/form/models/genericForm';
import {GenericYesNo} from '../../../../common/form/models/genericYesNo';
import {YesNo} from '../../../../common/form/models/yesNo';
import {constructUrlWithNotEligibleReason} from '../../../../common/utils/urlFormatter';
import {NotEligibleReason} from '../../../../common/form/models/eligibility/NotEligibleReason';

const helpWithFeesEligibilityController = express.Router();
const helpWithFeesEligibilityViewPath = 'features/public/eligibility/help-with-fees';

function renderView(genericYesNoForm: GenericForm<GenericYesNo>, res: express.Response): void {
  const form = Object.assign(genericYesNoForm);
  form.option = genericYesNoForm.model.option;
  res.render(helpWithFeesEligibilityViewPath, {form});
}

helpWithFeesEligibilityController.get(ELIGIBILITY_HELP_WITH_FEES_URL, (req: express.Request, res: express.Response) => {
  const cookie = req.cookies['eligibility'] ? req.cookies['eligibility'] : {};
  const eligibleHelpWithFees = cookie.eligibleHelpWithFees;
  const genericYesNoForm = new GenericForm(new GenericYesNo(eligibleHelpWithFees));
  renderView(genericYesNoForm, res);
});

helpWithFeesEligibilityController.post(ELIGIBILITY_HELP_WITH_FEES_URL, async (req: express.Request, res: express.Response) => {
  const genericYesNoForm = new GenericForm(new GenericYesNo(req.body.option));
  await genericYesNoForm.validate();

  if (genericYesNoForm.hasErrors()) {
    renderView(genericYesNoForm, res);
  } else {
    const cookie = req.cookies['eligibility'] ? req.cookies['eligibility'] : {};
    cookie.eligibleHelpWithFees = genericYesNoForm.model.option;
    res.cookie('eligibility', cookie);
    genericYesNoForm.model.option === YesNo.YES
      ? res.redirect(ELIGIBILITY_INFORMATION_ABOUT_HELP_WITH_FEES_URL)
      : res.redirect(constructUrlWithNotEligibleReason(NOT_ELIGIBLE_FOR_THIS_SERVICE_URL, NotEligibleReason.HELP_WITH_FEES));
  }
});

export default helpWithFeesEligibilityController;
