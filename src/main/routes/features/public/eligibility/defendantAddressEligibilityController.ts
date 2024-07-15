import {Response, Router} from 'express';
import {
  ELIGIBILITY_DEFENDANT_ADDRESS_URL,
  ELIGIBILITY_CLAIM_TYPE_URL,
  NOT_ELIGIBLE_FOR_THIS_SERVICE_URL,
} from '../../../../routes/urls';
import {GenericForm} from '../../../../common/form/models/genericForm';
import {GenericYesNo} from '../../../../common/form/models/genericYesNo';
import {YesNo} from '../../../../common/form/models/yesNo';

const defendantAddressEligibilityController = Router();
const defendantEligibilityViewPath = 'features/public/eligibility/defendant-eligible-address';

function renderView(form: GenericForm<GenericYesNo>, res: Response): void {
  res.render(defendantEligibilityViewPath, {form});
}

defendantAddressEligibilityController.get(ELIGIBILITY_DEFENDANT_ADDRESS_URL, (req, res) => {
  const cookie = req.cookies['eligibility'] ? req.cookies['eligibility'] : {};
  const eligibleDefendantAddress = cookie.eligibleDefendantAddress;
  const genericYesNoForm = new GenericForm(new GenericYesNo(eligibleDefendantAddress));
  renderView(genericYesNoForm, res);
});

defendantAddressEligibilityController.post(ELIGIBILITY_DEFENDANT_ADDRESS_URL, (req, res) => {
  const genericYesNoForm = new GenericForm(new GenericYesNo(req.body.option, 'ERRORS.VALID_YES_NO_OPTION_COMMON'));
  genericYesNoForm.validateSync();

  if (genericYesNoForm.hasErrors()) {
    renderView(genericYesNoForm, res);
  } else {
    const cookie = req.cookies['eligibility'] ? req.cookies['eligibility'] : {};
    cookie.eligibleDefendantAddress = genericYesNoForm.model.option;
    res.cookie('eligibility', cookie);
    genericYesNoForm.model.option === YesNo.YES
      ? res.redirect(ELIGIBILITY_CLAIM_TYPE_URL)
      : res.redirect(NOT_ELIGIBLE_FOR_THIS_SERVICE_URL + '?reason=defendant-address');
  }
});

export default defendantAddressEligibilityController;
