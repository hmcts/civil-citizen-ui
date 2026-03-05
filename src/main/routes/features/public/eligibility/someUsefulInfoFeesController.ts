import {Response, Router} from 'express';
import {
  ELIGIBILITY_INFORMATION_FEES_URL,
  ELIGIBILITY_APPLY_HELP_FEES_URL,
  ELIGIBILITY_HELP_WITH_FEES_URL,
} from 'routes/urls';
import {GenericForm} from 'form/models/genericForm';
import {GenericYesNo} from 'form/models/genericYesNo';
import {YesNo} from 'form/models/yesNo';

const someUsefulInfoFeesController = Router();
const someUsefulInfoFeesViewPath = 'features/public/eligibility/some-useful-info-fees';

function renderView(form: GenericForm<GenericYesNo>, res: Response): void {
  res.render(someUsefulInfoFeesViewPath, {form, pageTitle: 'PAGES.ELIGIBILITY_USEFUL_INFO_FEES.TITLE'});
}

someUsefulInfoFeesController.get(ELIGIBILITY_INFORMATION_FEES_URL, (req, res) => {
  const cookie = req.cookies['eligibility'] ? req.cookies['eligibility'] : {};
  const someUsefulInfoFees = cookie?.someUsefulInfoFees;
  const genericYesNoForm = new GenericForm(new GenericYesNo(someUsefulInfoFees));
  renderView(genericYesNoForm, res);
});

someUsefulInfoFeesController.post(ELIGIBILITY_INFORMATION_FEES_URL, (req, res) => {
  const genericYesNoForm = new GenericForm(new GenericYesNo(req.body.option, 'ERRORS.CONTINUE_HELP_WITH_FEES_REQUIRED'));
  genericYesNoForm.validateSync();
  if (genericYesNoForm.hasErrors()) {
    renderView(genericYesNoForm, res);
  } else {
    const cookie = req.cookies['eligibility'] ? req.cookies['eligibility'] : {};
    cookie.someUsefulInfoFees = genericYesNoForm.model.option;
    res.cookie('eligibility', cookie);
    genericYesNoForm.model.option === YesNo.YES
      ? res.redirect(ELIGIBILITY_APPLY_HELP_FEES_URL)
      : res.redirect(ELIGIBILITY_HELP_WITH_FEES_URL);
  }
});

export default someUsefulInfoFeesController;
