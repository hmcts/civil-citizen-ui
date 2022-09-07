import * as express from 'express';
import {
  ELIGIBILITY_HELP_WITH_FEES_URL,
  ELIGIBILITY_INFORMATION_ABOUT_HELP_WITH_FEES_URL,
  ELIGIBLE_FOR_THIS_SERVICE_URL,
} from '../../../../routes/urls';
import {GenericForm} from '../../../../common/form/models/genericForm';
import {GenericYesNo} from '../../../../common/form/models/genericYesNo';
import {YesNo} from '../../../../common/form/models/yesNo';

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
      : res.redirect(ELIGIBLE_FOR_THIS_SERVICE_URL);
  }
});

export default helpWithFeesEligibilityController;
