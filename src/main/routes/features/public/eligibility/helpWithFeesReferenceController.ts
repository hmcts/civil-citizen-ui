import * as express from 'express';
import {
  ELIGIBILITY_HWF_ELIGIBLE, ELIGIBILITY_HELP_WITH_FEES_REFERENCE, ELIGIBILITY_HWF_ELIGIBLE_REFERENCE,
} from '../../../../routes/urls';
import {GenericForm} from '../../../../common/form/models/genericForm';
import {GenericYesNo} from '../../../../common/form/models/genericYesNo';
import {YesNo} from '../../../../common/form/models/yesNo';

const helpWithFeesReferenceController = express.Router();
const helpWithFeesViewPath = 'features/public/eligibility/help-with-fees-reference';

function renderView(genericYesNoForm: GenericForm<GenericYesNo>, res: express.Response): void {
  const form = Object.assign(genericYesNoForm);
  form.option = genericYesNoForm.model.option;
  res.render(helpWithFeesViewPath, {form});
}

helpWithFeesReferenceController.get(ELIGIBILITY_HELP_WITH_FEES_REFERENCE, (req, res) => {
  const cookie = req.cookies['eligibility'] ? req.cookies['eligibility'] : {};
  const hwfReference = cookie.hwfReference;
  const genericYesNoForm = new GenericForm(new GenericYesNo(hwfReference));
  renderView(genericYesNoForm, res);
});

helpWithFeesReferenceController.post(ELIGIBILITY_HELP_WITH_FEES_REFERENCE, (req, res) => {
  const genericYesNoForm = new GenericForm(new GenericYesNo(req.body.option));
  genericYesNoForm.validateSync();

  if (genericYesNoForm.hasErrors()) {
    renderView(genericYesNoForm, res);
  } else {
    const cookie = req.cookies['eligibility'] ? req.cookies['eligibility'] : {};
    cookie.hwfReference = genericYesNoForm.model.option;
    res.cookie('eligibility', cookie);
    genericYesNoForm.model.option === YesNo.YES
      ? res.redirect(ELIGIBILITY_HWF_ELIGIBLE_REFERENCE)
      : res.redirect(ELIGIBILITY_HWF_ELIGIBLE);
  }
});

export default helpWithFeesReferenceController;
