import * as express from 'express';
import {
  ELIGIBILITY_DEFENDANT_ADDRESS_URL,
  ELIGIBILITY_SINGLE_DEFENDANT_URL,
  NOT_ELIGIBLE_URL,
} from '../../../../routes/urls';
import {GenericForm} from '../../../../common/form/models/genericForm';
import {GenericYesNo} from '../../../../common/form/models/genericYesNo';
import {YesNo} from '../../../../common/form/models/yesNo';

const singleDefendantController = express.Router();
const singleDefendantViewPath = 'features/public/eligibility/single-defendant';

function renderView(genericYesNoForm: GenericForm<GenericYesNo>, res: express.Response): void {
  const form = Object.assign(genericYesNoForm);
  form.option = genericYesNoForm.model.option;
  res.render(singleDefendantViewPath, {form});
}

singleDefendantController.get(ELIGIBILITY_SINGLE_DEFENDANT_URL, (req, res) => {
  const cookie = req.cookies['eligibility'] ? req.cookies['eligibility'] : undefined;
  const singleDefendant = cookie?.singleDefendant;
  const genericYesNoForm = new GenericForm(new GenericYesNo(singleDefendant));
  renderView(genericYesNoForm, res);
});

singleDefendantController.post(ELIGIBILITY_SINGLE_DEFENDANT_URL, (req, res) => {
  const genericYesNoForm = new GenericForm(new GenericYesNo(req.body.option));
  genericYesNoForm.validateSync();

  if (genericYesNoForm.hasErrors()) {
    renderView(genericYesNoForm, res);
  } else {
    const cookie = req.cookies['eligibility'] ? req.cookies['eligibility'] : {};
    cookie.singleDefendant = genericYesNoForm.model.option;
    res.cookie('eligibility', cookie);
    genericYesNoForm.model.option === YesNo.YES
      ? res.redirect(NOT_ELIGIBLE_URL + '?reason=multiple-defendants')
      : res.redirect(ELIGIBILITY_DEFENDANT_ADDRESS_URL);
  }
});

export default singleDefendantController;
