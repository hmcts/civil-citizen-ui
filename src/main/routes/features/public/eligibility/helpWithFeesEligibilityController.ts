import {Request, Response, Router} from 'express';
import {
  ELIGIBILITY_HELP_WITH_FEES_URL,
  ELIGIBILITY_INFORMATION_ABOUT_HELP_WITH_FEES_URL,
  ELIGIBLE_FOR_THIS_SERVICE_URL,
} from 'routes/urls';
import {GenericForm} from 'form/models/genericForm';
import {GenericYesNo} from 'form/models/genericYesNo';
import {YesNo} from 'form/models/yesNo';

const helpWithFeesEligibilityController = Router();
const helpWithFeesEligibilityViewPath = 'features/public/eligibility/help-with-fees';

function renderView(form: GenericForm<GenericYesNo>, res: Response): void {
  res.render(helpWithFeesEligibilityViewPath, {form, pageTitle: 'PAGES.ELIGIBILITY_HELP_WITH_FEES.PAGE_TITLE'});
}

helpWithFeesEligibilityController.get(ELIGIBILITY_HELP_WITH_FEES_URL, (req: Request, res: Response) => {
  const cookie = req.cookies['eligibility'] ? req.cookies['eligibility'] : {};
  const eligibleHelpWithFees = cookie.eligibleHelpWithFees;
  const genericYesNoForm = new GenericForm(new GenericYesNo(eligibleHelpWithFees));
  renderView(genericYesNoForm, res);
});

helpWithFeesEligibilityController.post(ELIGIBILITY_HELP_WITH_FEES_URL, async (req: Request, res: Response) => {
  const genericYesNoForm = new GenericForm(new GenericYesNo(req.body.option, 'ERRORS.HELP_WITH_FEES_REQUIRED'));
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
