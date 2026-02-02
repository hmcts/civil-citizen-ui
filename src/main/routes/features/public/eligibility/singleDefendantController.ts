import {Response, Router} from 'express';
import {
  ELIGIBILITY_DEFENDANT_ADDRESS_URL,
  ELIGIBILITY_SINGLE_DEFENDANT_URL,
  NOT_ELIGIBLE_FOR_THIS_SERVICE_URL,
} from 'routes/urls';
import {GenericForm} from 'form/models/genericForm';
import {GenericYesNo} from 'form/models/genericYesNo';
import {YesNo} from 'form/models/yesNo';

const singleDefendantController = Router();
const singleDefendantViewPath = 'features/public/eligibility/single-defendant';

function renderView(form: GenericForm<GenericYesNo>, res: Response): void {
  res.render(singleDefendantViewPath, {form, pageTitle: 'PAGES.ELIGIBILITY_SINGLE_DEFENDANT.PAGE_TITLE'});
}

singleDefendantController.get(ELIGIBILITY_SINGLE_DEFENDANT_URL, (req, res) => {
  const cookie = req.cookies['eligibility'] ? req.cookies['eligibility'] : undefined;
  const singleDefendant = cookie?.singleDefendant;
  const genericYesNoForm = new GenericForm(new GenericYesNo(singleDefendant));
  renderView(genericYesNoForm, res);
});

singleDefendantController.post(ELIGIBILITY_SINGLE_DEFENDANT_URL, (req, res) => {
  const genericYesNoForm = new GenericForm(new GenericYesNo(req.body.option, 'ERRORS.SINGLE_DEFENDANT_REQUIRED'));
  genericYesNoForm.validateSync();

  if (genericYesNoForm.hasErrors()) {
    renderView(genericYesNoForm, res);
  } else {
    const cookie = req.cookies['eligibility'] ? req.cookies['eligibility'] : {};
    cookie.singleDefendant = genericYesNoForm.model.option;
    res.cookie('eligibility', cookie);
    genericYesNoForm.model.option === YesNo.YES
      ? res.redirect(NOT_ELIGIBLE_FOR_THIS_SERVICE_URL + '?reason=multiple-defendants')
      : res.redirect(ELIGIBILITY_DEFENDANT_ADDRESS_URL);
  }
});

export default singleDefendantController;
